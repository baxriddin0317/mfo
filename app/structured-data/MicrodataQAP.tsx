import { Question, QuestionsResponse } from "@/app/services/questionsService";
import { PageDatesResponse } from "../services/PageDatesService";

type AnswerSchema = {
	"@type": "Answer";
	text: string;
	dateCreated?: string | null;
	upvoteCount: number;
	downvoteCount: number;
	author: {
		"@type": "Person" | "Organization";
		name: string;
	};
};

type QuestionSchema = {
	"@type": "Question";
	name: string;
	text: string;
	author: { "@type": "Person"; name: string };
	dateCreated?: string | null;
	upvoteCount: number;
	downvoteCount: number;
	answerCount: number;
	acceptedAnswer?: AnswerSchema;
	suggestedAnswer?: AnswerSchema[];
};

type MicrodataQAPProps = {
	questions: QuestionsResponse["data"];
	locale: "ru" | "ua";
	dates?: PageDatesResponse | null;
};

export const MicrodataQAP = ({ questions, dates }: MicrodataQAPProps) => {
	if (typeof window !== "undefined") return null;

	if (!questions || questions.length === 0) return null;

	// Сделаем быстрый список всех reply-элементов (вне зависимости, вложены они или нет)
	const allRepliesById = new Map<number, Question>();
	questions.forEach((q) => {
		if (q.is_reply) {
			allRepliesById.set(q.id, q);
		}
	});

	// Берём только корневые вопросы (те, которые НЕ реплаи)
	const rootQuestions = questions.filter((q) => !q.is_reply);

	const mainEntity: QuestionSchema[] = rootQuestions.map((q) => {
		const answers: AnswerSchema[] = [];

		// 1) старый стиль ответа (если есть)
		if (q.answer_text) {
			answers.push({
				"@type": "Answer",
				text: q.answer_text,
				dateCreated: q.answered_at || q.created_at,
				upvoteCount:
					typeof q.helpful_count === "number" ? q.helpful_count : 0,
				downvoteCount:
					typeof q.not_helpful_count === "number"
						? q.not_helpful_count
						: 0,
				author: {
					"@type":
						q.answer_author || q.mfo?.name
							? "Organization"
							: "Person",
					name: q.answer_author || q.mfo?.name || "MFoxa",
				},
			});
		}

		// 2) ответы из q.replies (если они вложены)
		const replyCandidates: Question[] = [];
		if (Array.isArray(q.replies) && q.replies.length > 0) {
			replyCandidates.push(...q.replies);
		}

		// 3) + ответы, которые могут быть в общем массиве questions как отдельные записи (is_reply === true && parent_id === q.id)
		questions.forEach((item) => {
			if (item.is_reply && item.parent_id === q.id) {
				// не добавляем, если уже есть в replyCandidates (по id)
				if (!replyCandidates.some((r) => r.id === item.id)) {
					replyCandidates.push(item);
				}
			}
		});

		// дедуплицируем по id и превращаем в AnswerSchema
		const seenReplyIds = new Set<number>();
		replyCandidates.forEach((reply) => {
			if (!reply || seenReplyIds.has(reply.id)) return;
			// ответный текст может храниться в answer_text или в question_text (ваш реальный кейс)
			const answerText = reply.answer_text ?? reply.question_text;
			if (!answerText) return;

			seenReplyIds.add(reply.id);

			answers.push({
				"@type": "Answer",
				text: answerText,
				dateCreated: reply.answered_at || reply.created_at,
				upvoteCount:
					typeof reply.helpful_count === "number"
						? reply.helpful_count
						: 0,
				downvoteCount:
					typeof reply.not_helpful_count === "number"
						? reply.not_helpful_count
						: 0,
				author: {
					"@type": "Person",
					name: reply.author_name || "Аноним",
				},
			});
		});

		// Собираем QuestionSchema (upvoteCount/downvoteCount всегда числа)
		const questionSchema: QuestionSchema = {
			"@type": "Question",
			name: q.question_text,
			text: q.question_text,
			author: { "@type": "Person", name: q.author_name || "Аноним" },
			dateCreated: q.created_at,
			upvoteCount:
				typeof q.helpful_count === "number" ? q.helpful_count : 0,
			downvoteCount:
				typeof q.not_helpful_count === "number"
					? q.not_helpful_count
					: 0,
			answerCount: answers.length,
			acceptedAnswer: answers[0] ?? undefined,
			suggestedAnswer: answers.length > 1 ? answers.slice(1) : undefined,
		};

		return questionSchema;
	});

	const qaSchema = {
		"@context": "https://schema.org",
		"@type": "QAPage",
		datePublished: dates?.date_published,
		dateModified: dates?.date_modified,
		mainEntity,
	};

	return (
		<script
			id="qap-questions"
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(qaSchema) }}
		/>
	);
};

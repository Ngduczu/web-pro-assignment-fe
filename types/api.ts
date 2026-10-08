export type Role = "Student" | "Teacher" | "Admin";
export type AccountStatus = "Active" | "Inactive" | "Disabled" | "Banned";
export type CourseStatus = "Open" | "Closed";
export type EnrollmentStatus = "Waiting" | "Accepted" | "Rejected" | "Cancelled";
export type LessonStatus = "Draft" | "Published";
export type ExerciseStatus = "Draft" | "Published" | "Closed";
export type SubmissionStatus = "Draft" | "Submitted" | "Graded";
export type QuestionType = "MultipleChoice" | "FillInBlank";
export type QuestionDifficulty = "Easy" | "Medium" | "Hard";
export type ExaminationStatus = "Draft" | "Published" | "Closed";
export type ExaminationQuestionSelectionMode = "Random" | "Manual";
export type ExaminationAttemptStatus = "InProgress" | "Disconnected" | "Submitted" | "AutoSubmitted";
export type ExaminationSubmitReason = "StudentSubmitted" | "DurationExpired" | "DisconnectTimeout" | "MaxViolationsExceeded" | "ExaminationClosed";
export type ExaminationViolationType = "ExitFullscreen" | "TabChanged" | "WindowBlurred" | "CopyAttempt" | "PasteAttempt" | "RightClickAttempt" | "DevToolsSuspected";

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
};

export type LoginRequest = { email: string; password: string };
export type LoginResponse = { accessToken: string; expiresAt: string; refreshToken: string; refreshTokenExpiresAt: string };
export type RefreshTokenRequest = { refreshToken: string };
export type OAuthLoginCodeRequest = { loginCode: string };
export type OAuthLoginCodeResponse = { loginCode: string; expiresAt: string };
export type RegisterAccountRequest = { email: string; password: string; passwordConfirm: string };
export type VerifyEmailRequest = { email: string; verificationCode: string };
export type ResendVerificationRequest = { email: string };
export type ForgotPasswordRequest = { email: string };
export type ResetPasswordRequest = { email: string; resetCode: string; newPassword: string; passwordConfirm: string };
export type RegistrationDto = { userId: string; email: string; status: AccountStatus; verificationCodeExpiresAt: string };
export type EmailVerificationResultDto = { userId: string; email: string; status: AccountStatus; verifiedAt: string };
export type PasswordResetRequestedDto = { accepted: boolean; codeExpiresAt: string };
export type PasswordResetResultDto = { userId: string; email: string; status: AccountStatus; resetAt: string };
export type SessionResponse = { expiresAt: string; refreshTokenExpiresAt: string };
export type AuthenticatedSession = { user: UserProfileDto; expiresAt: string };

export type UserProfileDto = { id: string; email: string; fullName: string; phone: string | null; role: Role; status: AccountStatus; avatarUrl: string | null; createdAt: string };
export type UserQuery = { search?: string; page?: number; pageSize?: number };
export type AdminCreateUserRequest = { email: string; fullName: string; phone?: string | null; password: string; role: Role };
export type UpdateUserStatusRequest = { status: AccountStatus };
export type AdminUpdateUserRequest = { fullName: string; phone?: string | null; role: Role };
export type UpdateMyProfileRequest = { fullName: string; phone?: string | null };
export type ChatUserSearchDto = { id: string; email: string; fullName: string; avatarUrl: string | null };

export type CreateCourseRequest = { name: string; description?: string | null; teacherId: string; maxStudents: number; status?: CourseStatus };
export type UpdateCourseRequest = { name: string; description?: string | null; maxStudents: number; status: CourseStatus };
export type CourseQuery = { search?: string; status?: CourseStatus; teacherId?: string; includeDeleted?: boolean; page?: number; pageSize?: number };
export type CourseDto = { id: string; name: string; description: string | null; teacherId: string; maxStudents: number; status: CourseStatus; createdAt: string; modifiedAt: string; deletedAt: string | null };

export type EnrollmentQuery = { page?: number; pageSize?: number };
export type EnrollmentStudentDto = { id: string; fullName: string; email: string };
export type EnrollmentDto = { id: string; studentId: string; courseId: string; status: EnrollmentStatus; student: EnrollmentStudentDto | null; createdAt: string; modifiedAt: string };

export type CreateLessonRequest = { name: string; content?: string | null; order: number; status?: LessonStatus };
export type UpdateLessonRequest = { name: string; content?: string | null; order: number; status: LessonStatus };
export type LessonDto = { id: string; courseId: string; name: string; content: string | null; order: number; status: LessonStatus; createdAt: string; modifiedAt: string };
export type MaterialDto = { id: string; lessonId: string; fileName: string; objectKey: string; contentType: string; fileSize: number; createdAt: string; modifiedAt: string };

export type CreateExerciseRequest = { title: string; description?: string | null; dueAt?: string | null };
export type UpdateExerciseRequest = CreateExerciseRequest;
export type FileAttachmentDto = { id: string; fileName: string; objectKey: string; contentType: string; fileSize: number };
export type ExerciseDto = { id: string; courseId: string; title: string; description: string | null; dueAt: string | null; status: ExerciseStatus; attachment: FileAttachmentDto | null; createdAt: string; modifiedAt: string };
export type SubmissionQuery = { page?: number; pageSize?: number };
export type GradeSubmissionRequest = { grade: number; feedback?: string | null };
export type SubmissionStudentDto = { id: string; fullName: string; email: string };
export type SubmissionDto = { id: string; exerciseId: string; studentId: string; student: SubmissionStudentDto | null; status: SubmissionStatus; submittedAt: string | null; grade: number | null; feedback: string | null; gradedAt: string | null; gradedById: string | null; attachment: FileAttachmentDto | null; createdAt: string; modifiedAt: string };

export type CreateQuestionBankRequest = { teacherId: string; name: string; description?: string | null };
export type UpdateQuestionBankRequest = { name: string; description?: string | null };
export type QuestionBankDto = { id: string; teacherId: string; name: string; description: string | null; createdAt: string; modifiedAt: string };
export type MultipleChoiceOptionInput = { content: string; isCorrect: boolean };
export type FillInBlankAnswerInput = { blankOrder: number; expectedAnswer: string };
export type CreateMultipleChoiceQuestionRequest = { content: string; difficulty: QuestionDifficulty; shuffleOptions: boolean; options: MultipleChoiceOptionInput[] };
export type CreateFillInBlankQuestionRequest = { content: string; difficulty: QuestionDifficulty; answers: FillInBlankAnswerInput[] };
export type UpdateQuestionRequest = { content: string; difficulty: QuestionDifficulty };
export type MultipleChoiceOptionDto = { id: string; content: string; order: number; isCorrect: boolean };
export type FillInBlankAnswerDto = { id: string; blankOrder: number; expectedAnswer: string };
export type QuestionDto = { id: string; questionBankId: string; content: string; type: QuestionType; difficulty: QuestionDifficulty; shuffleOptions: boolean; options: MultipleChoiceOptionDto[]; answers: FillInBlankAnswerDto[]; createdAt: string; modifiedAt: string };

export type ExaminationSecuritySettings = { requireFullscreen: boolean; fullscreenGraceSeconds: number; maxViolations: number; blockCopyPaste: boolean; blockRightClick: boolean; detectTabChange: boolean; detectDevTools: boolean; maxDisconnectMinutes: number };
export type QuestionSelectionRuleInput = { questionBankId: string; difficulty: QuestionDifficulty; questionCount: number };
export type CreateExaminationRequest = { title: string; description?: string | null; startAt: string; dueAt: string; durationMinutes: number; shuffleQuestions: boolean; showScoreImmediately: boolean; security: ExaminationSecuritySettings; selectionMode: ExaminationQuestionSelectionMode; questionSelectionRules: QuestionSelectionRuleInput[]; questionIds: string[] };
export type UpdateExaminationRequest = Omit<CreateExaminationRequest, "selectionMode" | "questionSelectionRules" | "questionIds">;
export type QuestionSelectionRuleDto = { id: string; questionBankId: string; difficulty: QuestionDifficulty; questionCount: number };
export type ExaminationDto = { id: string; courseId: string; title: string; description: string | null; status: ExaminationStatus; startAt: string; dueAt: string; durationMinutes: number; shuffleQuestions: boolean; showScoreImmediately: boolean; security: ExaminationSecuritySettings; questionSelectionRules: QuestionSelectionRuleDto[]; selectionMode: ExaminationQuestionSelectionMode; selectedQuestionIds: string[]; questionCount: number; createdAt: string; modifiedAt: string };
export type StudentExaminationDto = Omit<ExaminationDto, "questionSelectionRules" | "selectionMode" | "selectedQuestionIds">;

export type StudentFillInBlankAnswerInput = { blankOrder: number; answerText: string };
export type StudentAnswerDto = { id: string; examinationQuestionId: string; questionType: QuestionType; selectedOptionId: string | null; fillInBlankAnswers: StudentFillInBlankAnswerInput[]; modifiedAt: string };
export type ExaminationAttemptDto = { id: string; examinationId: string; studentId: string; status: ExaminationAttemptStatus; submitReason: ExaminationSubmitReason | null; startedAt: string; submittedAt: string | null; disconnectedAt: string | null; remainingSeconds: number | null; lastActivityAt: string; violationCount: number; correctAnswers: number | null; totalQuestions: number | null; score: number | null };
export type ExaminationAttemptQuery = { page?: number; pageSize?: number };
export type ExaminationAttemptResultDto = { id: string; examinationId: string; studentId: string; studentFullName: string; studentEmail: string; status: ExaminationAttemptStatus; submitReason: ExaminationSubmitReason | null; startedAt: string; submittedAt: string | null; violationCount: number; correctAnswers: number | null; totalQuestions: number; score: number | null };
export type StudentExamOptionDto = { id: string; content: string; order: number };
export type StudentExamQuestionDto = { id: string; content: string; type: QuestionType; order: number; options: StudentExamOptionDto[] };

export type ChatRoomDto = { id: string; type: string; courseId: string | null; participantIds: string[]; createdAt: string; archivedAt: string | null };
export type ChatAttachmentDto = { id: string; fileName: string; contentType: string; fileSize: number };
export type ChatMessageDto = { id: string; chatRoomId: string; senderId: string; content: string | null; replyToMessageId: string | null; createdAt: string; editedAt: string | null; deletedAt: string | null; attachments: ChatAttachmentDto[] };
export type ChatPageQuery = { page?: number; pageSize?: number };
export type SendChatMessageRequest = { content?: string | null; replyToMessageId?: string | null };
export type EditChatMessageRequest = { content?: string | null };

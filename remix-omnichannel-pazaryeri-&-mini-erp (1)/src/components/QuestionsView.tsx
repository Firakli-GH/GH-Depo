import React, { useState } from 'react';
import { CustomerQuestion, QuestionStatus } from '../types';
import { CHANNEL_METADATA } from '../data/initialData';
import { 
  MessageSquare, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Search,
  Check
} from 'lucide-react';

interface QuestionsViewProps {
  questions: CustomerQuestion[];
  onAnswerQuestion: (questionId: string, answerText: string) => void;
}

export const QuestionsView: React.FC<QuestionsViewProps> = ({
  questions,
  onAnswerQuestion
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('WaitingAnswer');
  const [selectedQuestion, setSelectedQuestion] = useState<CustomerQuestion | null>(
    questions.find(q => q.status === 'WaitingAnswer') || questions[0] || null
  );
  const [answerInput, setAnswerInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Canned responses
  const cannedTemplates = [
    'Merhaba, siparişiniz bugün saat 16:00 ya kadar oluşturulduğunda aynı gün kargoya verilmektedir.',
    'Merhaba, ürünümüz %100 orijinal, adınıza faturalı ve 2 yıl resmi garantilidir.',
    'Merhaba, ürün standart kalıptır; günlük kullandığınız bedeni sipariş verebilirsiniz.',
    'Merhaba, kutu içeriğinde şarj kablosu ve kullanım kılavuzu yer almaktadır.'
  ];

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    return statusFilter === 'all' || q.status === statusFilter;
  });

  // Calculate SLA remaining string & urgency
  const getSlaInfo = (deadlineUtc: string, status: QuestionStatus) => {
    if (status === 'Answered') return { text: 'Yanıtlandı', color: 'text-slate-400', isUrgent: false };
    const diffMin = Math.round((new Date(deadlineUtc).getTime() - Date.now()) / 60000);
    if (diffMin <= 0) return { text: 'SLA Süresi Doldu', color: 'text-red-400 font-bold', isUrgent: true };
    if (diffMin < 60) return { text: `${diffMin} dk kaldı (Kritik)`, color: 'text-red-400 font-bold', isUrgent: true };
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    return { 
      text: `${hours} sa ${mins} dk kaldı`, 
      color: diffMin < 120 ? 'text-amber-400 font-semibold' : 'text-slate-300 font-mono', 
      isUrgent: diffMin < 120 
    };
  };

  const handleSendAnswer = async () => {
    if (!selectedQuestion || !answerInput.trim()) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 400));
    onAnswerQuestion(selectedQuestion.id, answerInput.trim());
    setIsSubmitting(false);
    setSuccessToast('Yanıtınız pazaryeri API sine iletildi.');
    setAnswerInput('');
    setTimeout(() => setSuccessToast(null), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <span>Müşteri Soru - Cevap Masası (SLA Takibi)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pazaryerlerinin satıcı puanını korumak için soruları SLA süresi içinde doğrudan yanıtlayın.
          </p>
        </div>

        {/* Status Segmented Filter */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('WaitingAnswer')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              statusFilter === 'WaitingAnswer' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bekleyenler ({questions.filter(q => q.status === 'WaitingAnswer').length})
          </button>
          <button
            onClick={() => setStatusFilter('Answered')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              statusFilter === 'Answered' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Yanıtlananlar ({questions.filter(q => q.status === 'Answered').length})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              statusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tümü ({questions.length})
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Question List, Right Response Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left List: 5 Cols */}
        <div className="lg:col-span-5 space-y-2 max-h-[75vh] overflow-y-auto pr-1">
          {filteredQuestions.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
              Bu filtrede soru bulunamadı.
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const isSelected = selectedQuestion?.id === q.id;
              const chInfo = CHANNEL_METADATA[q.channel];
              const sla = getSlaInfo(q.slaDeadlineUtc, q.status);

              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuestion(q)}
                  className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-slate-900/90 shadow-md shadow-blue-500/10' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${chInfo?.badgeBg}`}>
                        {chInfo?.name || q.channel}
                      </span>
                      <span className="font-semibold text-slate-200">{q.customerDisplayName}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className={sla.color}>{sla.text}</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-medium text-slate-300 line-clamp-1 mb-1">
                    {q.productTitle}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {q.questionText}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono">Soru ID: {q.channelQuestionId}</span>
                    <span>{new Date(q.questionDateUtc).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Response & Detail Pane: 7 Cols */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          {selectedQuestion ? (
            <>
              {/* Question Header & Context */}
              <div className="space-y-3 pb-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${CHANNEL_METADATA[selectedQuestion.channel]?.badgeBg}`}>
                      {CHANNEL_METADATA[selectedQuestion.channel]?.name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Barkod: {selectedQuestion.productBarcode}</span>
                  </div>

                  <div className="text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-slate-300 font-mono">
                      SLA: {new Date(selectedQuestion.slaDeadlineUtc).toLocaleTimeString('tr-TR')}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">İlgili Ürün</span>
                  <div className="text-xs font-semibold text-white mt-0.5">{selectedQuestion.productTitle}</div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200">{selectedQuestion.customerDisplayName} sordu:</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(selectedQuestion.questionDateUtc).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    "{selectedQuestion.questionText}"
                  </p>
                </div>
              </div>

              {/* Already Answered View or Answer Form */}
              {selectedQuestion.status === 'Answered' ? (
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Bu soru yanıtlandı</span>
                    <span className="text-slate-500 font-normal">· {selectedQuestion.answeredBy}</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    "{selectedQuestion.answerText}"
                  </p>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Yanıtlanma Tarihi: {selectedQuestion.answeredAtUtc ? new Date(selectedQuestion.answeredAtUtc).toLocaleString('tr-TR') : '-'}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Canned Templates */}
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>Hızlı Hazır Şablonlar:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cannedTemplates.map((tmpl, idx) => (
                        <button
                          key={idx}
                          onClick={() => setAnswerInput(tmpl)}
                          className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 rounded px-2.5 py-1 text-left truncate max-w-full transition-colors"
                        >
                          {tmpl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Textarea */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-medium">Satıcı Yanıtınız:</label>
                    <textarea
                      rows={4}
                      value={answerInput}
                      onChange={(e) => setAnswerInput(e.target.value)}
                      placeholder="Müşterinin sorusuna saygılı ve net bir yanıt yazınız..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Submit Action */}
                  <div className="flex items-center justify-between pt-2">
                    {successToast ? (
                      <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        <span>{successToast}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        Gönderilen yanıt ilgili pazaryerinin API'sine otomatik push edilir.
                      </span>
                    )}

                    <button
                      onClick={handleSendAnswer}
                      disabled={isSubmitting || !answerInput.trim()}
                      className={`px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-md transition-all ${
                        isSubmitting || !answerInput.trim() ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'İletiliyor...' : 'Yanıtla & Pazaryerine Gönder'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
              Lütfen soldan bir soru seçiniz.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

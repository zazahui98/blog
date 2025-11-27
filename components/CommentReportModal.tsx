'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Send, CheckCircle } from 'lucide-react';
import { reportComment } from '@/lib/supabase-helpers';

interface CommentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  commentId: string;
  commentAuthor: string;
  reporterId: string;
}

const reportReasons = [
  { id: 'spam', label: '垃圾信息', description: '广告、重复内容或无意义内容' },
  { id: 'harassment', label: '骚扰辱骂', description: '人身攻击、辱骂或骚扰内容' },
  { id: 'hate_speech', label: '仇恨言论', description: '基于种族、性别、宗教等的歧视性言论' },
  { id: 'misinformation', label: '虚假信息', description: '故意传播错误或误导性信息' },
  { id: 'inappropriate', label: '不当内容', description: '色情、暴力或其他不适宜内容' },
  { id: 'copyright', label: '版权侵犯', description: '未经授权使用他人作品' },
  { id: 'other', label: '其他', description: '其他违反社区规则的行为' },
];

export default function CommentReportModal({
  isOpen,
  onClose,
  commentId,
  commentAuthor,
  reporterId,
}: CommentReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setLoading(true);
    
    const reasonLabel = reportReasons.find(r => r.id === selectedReason)?.label || selectedReason;
    const { error } = await reportComment(
      commentId, 
      reporterId, 
      reasonLabel,
      description || undefined
    );

    if (!error) {
      setSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
    
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // 重置状态
      setTimeout(() => {
        setSelectedReason('');
        setDescription('');
        setSubmitted(false);
      }, 300);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* 模态框 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden"
          >
            {submitted ? (
              // 提交成功状态
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </motion.div>
                <h3 className="text-lg font-semibold text-white mb-2">举报已提交</h3>
                <p className="text-gray-400 text-sm">
                  感谢您的举报，我们会尽快处理
                </p>
              </div>
            ) : (
              // 举报表单
              <>
                {/* 头部 */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">举报评论</h3>
                      <p className="text-sm text-gray-400">
                        来自 <span className="text-cyan-400">{commentAuthor}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 内容 */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      请选择举报原因 <span className="text-red-400">*</span>
                    </label>
                    <div className="space-y-2">
                      {reportReasons.map((reason) => (
                        <label
                          key={reason.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedReason === reason.id
                              ? 'bg-red-500/10 border-red-500/50'
                              : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="reason"
                            value={reason.id}
                            checked={selectedReason === reason.id}
                            onChange={(e) => setSelectedReason(e.target.value)}
                            className="mt-1 w-4 h-4 text-red-500 border-slate-600 focus:ring-red-500 focus:ring-offset-0 bg-slate-800"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">
                              {reason.label}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {reason.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 补充说明 */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      补充说明（可选）
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="请详细描述违规行为..."
                      rows={3}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* 底部按钮 */}
                <div className="flex gap-3 p-6 border-t border-slate-700">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 text-gray-400 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedReason || loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{loading ? '提交中...' : '提交举报'}</span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

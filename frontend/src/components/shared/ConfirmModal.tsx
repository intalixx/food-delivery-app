import { Loader2 } from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';

interface ConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    variant?: 'danger' | 'default';
    onConfirm: () => void;
}

export default function ConfirmModal({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isLoading = false,
    variant = 'default',
    onConfirm
}: ConfirmModalProps) {
    const isDanger = variant === 'danger';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-sm p-0 overflow-hidden"
                showCloseButton={false}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <div className="p-6 pb-5">
                    <DialogHeader className="text-center sm:text-center">
                        <DialogTitle className="text-[18px] font-bold text-gray-900 dark:text-white">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-[14px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                    <button
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold text-[14px] cursor-pointer disabled:opacity-50 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 py-2.5 rounded-xl font-semibold text-[14px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 ${isDanger
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-primary text-white hover:bg-primary/90'
                            }`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            confirmLabel
                        )}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

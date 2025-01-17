import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define error types and their properties
const errorTypes = {
    error: {
        icon: XCircle,
        title: 'Error',
        className: 'border-red-500 text-red-500',
    },
    warning: {
        icon: AlertTriangle,
        title: 'Warning',
        className: 'border-yellow-500 text-yellow-500',
    },
    info: {
        icon: Info,
        title: 'Info',
        className: 'border-blue-500 text-blue-500',
    },
};

interface ErrorProps {
    type?: keyof typeof errorTypes;
    title?: string;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    onDismiss?: () => void;
}

const ErrorComponent = ({
    type = 'error',
    title,
    message,
    action,
    onDismiss,
}: ErrorProps) => {
    const errorConfig = errorTypes[type];
    const Icon = errorConfig.icon;

    return (
        <Alert className={`mb-4 animate-in fade-in-50 ${errorConfig.className}`}>
            <Icon className="h-5 w-5" />
            <AlertTitle className="ml-2">
                {title || errorConfig.title}
            </AlertTitle>
            <AlertDescription className="ml-7 mt-2 flex items-center justify-between">
                <span>{message}</span>
                <div className="flex gap-2 ml-4">
                    {action && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={action.onClick}
                            className="text-xs"
                        >
                            {action.label}
                        </Button>
                    )}
                    {onDismiss && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDismiss}
                            className="text-xs"
                        >
                            Dismiss
                        </Button>
                    )}
                </div>
            </AlertDescription>
        </Alert>
    );
};

export default ErrorComponent;
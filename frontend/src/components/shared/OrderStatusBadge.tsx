

type OrderStatus = 'Order Received' | 'Preparing' | 'Out for Delivery' | 'Delivered' | string;

interface OrderStatusBadgeProps {
    status: OrderStatus;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    let colorClasses = '';

    switch (status) {
        case 'Order Received':
            colorClasses = 'text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-900/30';
            break;
        case 'Preparing':
            colorClasses = 'text-pink-600 dark:text-pink-500 bg-pink-50 dark:bg-pink-900/30';
            break;
        case 'Out for Delivery':
            colorClasses = 'text-purple-600 dark:text-purple-500 bg-purple-50 dark:bg-purple-900/30';
            break;
        case 'Delivered':
            colorClasses = 'text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/30';
            break;
        default:
            colorClasses = 'text-gray-600 dark:text-gray-500 bg-gray-50 dark:bg-gray-800';
            break;
    }

    return (
        <span className={`${colorClasses} px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap inline-flex items-center justify-center`}>
            {status}
        </span>
    );
}

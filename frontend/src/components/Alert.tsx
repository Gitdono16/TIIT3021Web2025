type AlertProps = {
    type?: "success" | "error" | "info";
    message: string;
};

export default function Alert({ type = "info", message }: AlertProps) {
    const colorMap = {
        success: "bg-green-50 text-green-700 border-green-400",
        error: "bg-red-50 text-red-700 border-red-400",
        info: "bg-blue-50 text-blue-700 border-blue-400",
    }[type];

    return (
        <div
            className={`border-l-4 p-3 my-3 rounded-md text-sm font-medium ${colorMap}`}
            role="alert"
        >
            {message}
        </div>
    );
}

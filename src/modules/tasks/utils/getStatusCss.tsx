export const getStatusStyle = (status: string) => {
    switch (status) {
        case "Done":
            return "bg-green-100 text-green-700";

        case "In Progress":
            return "bg-blue-100 text-blue-700";

        case "In Review":
            return "bg-purple-100 text-purple-700";

        case "Testing":
            return "bg-cyan-100 text-cyan-700";

        case "To Do":
            return "bg-yellow-100 text-yellow-700";

        case "Backlog":
            return "bg-gray-100 text-gray-700";

        default:
            return "bg-gray-100 text-gray-700";
    }
};
export const getAssigneeColor = (name: string) => {
    switch (name) {
        case "Marcus":
            return "bg-blue-600";

        case "Priya":
            return "bg-pink-600";

        case "Jordan":
            return "bg-green-600";

        case "Alex":
            return "bg-purple-600";

        case "Sarah":
            return "bg-orange-600";

        default:
            return "bg-gray-600";
    }
};
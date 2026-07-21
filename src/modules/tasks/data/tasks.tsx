import { Task } from "@/src/types/task";

export const tasksData : Task[]=[
    {
        "id": "ATL-1",
        "title": "Design new API authentication flow",
        "priority": "High",
        "status": "Done",
        "assignee": {
            "name": "Marcus",
            "initials": "MU",
            "color": "#6366F1",
        },
        "points": 8,
        "dueDate": "Jul 5",
        "sprint": "Sprint 12",
        "labels": [
            "backend",
            "security"
        ]
    },
    {
        "id": "ATL-2",
        "title": "Implement rate limiting middleware",
        "priority": "Critical",
        "status": "In Progress",
        "assignee": {
            "name": "Marcus",
            "initials": "MU",
            "color": "#6366F1",
        },
        "points": 13,
        "dueDate": "Jul 12",
        "sprint": "Sprint 12",
        "labels": [
            "backend",
            "performance"
        ]
    },
    {
        "id": "ATL-3",
        "title": "Refactor database connection pooling",
        "priority": "High",
        "status": "In Review",
        "assignee": {
            "name": "Marcus",
            "initials": "MU",
            "color": "#6366F1",
        },
        "points": 8,
        "dueDate": "Jul 14",
        "sprint": "Sprint 12",
        "labels": [
            "backend",
            "database"
        ]
    },
    {
        "id": "ATL-4",
        "title": "Update API documentation with examples",
        "priority": "Medium",
        "status": "To Do",
        "assignee": {
            "name": "Priya",
            "initials": "PP",
            "color": "#EC4899"
        },
        "points": 3,
        "dueDate": "Jul 18",
        "sprint": "Sprint 12",
        "labels": [
            "docs"
        ]
    },
    {
        "id": "ATL-5",
        "title": "Set up CI/CD pipeline for staging",
        "priority": "High",
        "status": "Testing",
        "assignee": {
            "name": "Jordan",
            "initials": "JW",
            "color": "#F59E0B"
        },
        "points": 5,
        "dueDate": "Jul 10",
        "sprint": "Sprint 12",
        "labels": [
            "devops"
        ]
    },
    {
        "id": "ATL-6",
        "title": "Performance profiling and optimization",
        "priority": "Medium",
        "status": "Backlog",
        "assignee": {
            "name": "Marcus",
            "initials": "MU",
            "color": "#6366F1",

        },
        "points": 13,
        "dueDate": "Jul 25",
        "sprint": "Sprint 13",
        "labels": [
            "performance"
        ]
    },
    {
        "id": "MOB-1",
        "title": "Redesign home screen layout",
        "priority": "High",
        "status": "In Progress",
        "assignee": {
            "name": "Alex",
            "initials": "AK",
            "color": "#14B8A6"
        },
        "points": 8,
        "dueDate": "Jul 15",
        "sprint": "Sprint 3",
        "labels": [
            "design",
            "mobile"
        ]
    },
    {
        "id": "MOB-2",
        "title": "Implement push notifications",
        "priority": "Medium",
        "status": "To Do",
        "assignee": {
            "name": "Priya",
            "initials": "PP",
            "color": "#EC4899"
        },
        "points": 5,
        "dueDate": "Jul 22",
        "sprint": "Sprint 3",
        "labels": [
            "mobile",
            "feature"
        ]
    },
    {
        "id": "MOB-3",
        "title": "Fix crash on iOS 16.4 deep link flow",
        "priority": "Critical",
        "status": "In Progress",
        "assignee": {
            "name": "Priya",
            "initials": "PP",
            "color": "#EC4899"
        },
        "points": 3,
        "dueDate": "Jul 8",
        "sprint": "Sprint 3",
        "labels": [
            "bug",
            "ios"
        ]
    },
    {
        "id": "MOB-4",
        "title": "Offline mode data sync",
        "priority": "High",
        "status": "Backlog",
        "assignee": {
            "name": "Marcus",
            "initials": "MU",
            "color": "#6366F1",
        },
        "points": 13,
        "dueDate": "Aug 1",
        "sprint": "Sprint 4",
        "labels": [
            "feature",
            "mobile"
        ]
    },
    {
        "id": "DAT-1",
        "title": "Build Kafka consumer service",
        "priority": "Critical",
        "status": "Done",
        "assignee": { "name": "Marcus", "initials": "MJ", "color": "#6366F1", },
        "points": 13,
        "dueDate": "Jul 1",
        "sprint": "Sprint 7",
        "labels": ["backend", "kafka"]
    },
    {
        "id": "DAT-2",
        "title": "Create analytics dashboard UI",
        "priority": "High",
        "status": "In Review",
        "assignee": { "name": "Priya", "initials": "PP", "color": "#EC4899" },
        "points": 8,
        "dueDate": "Jul 10",
        "sprint": "Sprint 7",
        "labels": ["frontend", "dashboard"]
    },
    {
        "id": "DAT-3",
        "title": "Write unit tests for ETL jobs",
        "priority": "Medium",
        "status": "Testing",
        "assignee": { "name": "Jordan", "initials": "JW", "color": "#F59E0B" },
        "points": 5,
        "dueDate": "Jul 12",
        "sprint": "Sprint 7",
        "labels": ["testing", "backend"]
    },
    {
        "id": "DS-1",
        "title": "Define color token system",
        "priority": "High",
        "status": "Done",
        "assignee": { "name": "Alex", "initials": "AK", "color": "#14B8A6" },
        "points": 5,
        "dueDate": "Jul 3",
        "sprint": "Sprint 1",
        "labels": ["design", "tokens"]
    },
    {
        "id": "DS-2",
        "title": "Build Button component variants",
        "priority": "Medium",
        "status": "In Progress",
        "assignee": { "name": "Priya", "initials": "PP", "color": "#EC4899" },
        "points": 3,
        "dueDate": "Jul 15",
        "sprint": "Sprint 1",
        "labels": ["component", "frontend"]
    },
    {
        "id": "DS-3",
        "title": "Document component usage guidelines",
        "priority": "Low",
        "status": "To Do",
        "assignee": { "name": "Alex", "initials": "AK", "color": "#14B8A6" },
        "points": 2,
        "dueDate": "Jul 20",
        "sprint": "Sprint 1",
        "labels": ["docs", "design"]
    },
    {
        "id": "CTP-1",
        "title": "Wireframes for customer portal",
        "priority": "High",
        "status": "In Progress",
        "assignee": { "name": "Alex", "initials": "AK", "color": "#14B8A6" },
        "points": 8,
        "dueDate": "Jul 18",
        "sprint": "Sprint 1",
        "labels": ["design", "ux"]
    },
    {
        "id": "CTP-2",
        "title": "Set up project repository and CI",
        "priority": "Medium",
        "status": "Done",
        "assignee": { "name": "Marcus", "initials": "MJ", "color": "#6366F1", },
        "points": 1,
        "dueDate": "Jul 5",
        "sprint": "Sprint 1",
        "labels": ["setup"]
    },
    {
        "id": "CTP-3",
        "title": "Define tech stack and architecture",
        "priority": "Critical",
        "status": "In Review",
        "assignee": { "name": "Marcus", "initials": "MJ", "color": "#6366F1", },
        "points": 5,
        "dueDate": "Jul 10",
        "sprint": "Sprint 1",
        "labels": ["architecture", "backend"]
    }
]
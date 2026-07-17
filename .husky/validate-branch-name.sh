#!/bin/bash

# Get the current branch name
branch=$(git rev-parse --abbrev-ref HEAD)

# Define valid branch name patterns
# You can customize these patterns according to your team's conventions
valid_pattern="^(feature|bugfix|hotfix|release|chore|docs|test|refactor)\/[a-z0-9._-]+$|^(main|master|develop|staging)$"

# Check if branch name matches the pattern
if [[ $branch =~ $valid_pattern ]]; then
  echo "✅ Branch name '$branch' is valid"
  exit 0
else
  echo "❌ Branch name '$branch' does not follow the naming convention!"
  echo ""
  echo "Valid branch name patterns:"
  echo "  • feature/your-feature-name"
  echo "  • bugfix/your-bug-fix"
  echo "  • hotfix/your-hotfix"
  echo "  • release/version-number"
  echo "  • chore/your-chore"
  echo "  • docs/your-documentation"
  echo "  • test/your-test"
  echo "  • refactor/your-refactor"
  echo "  • main, master, develop, staging (protected branches)"
  echo ""
  echo "Examples:"
  echo "  • feature/user-authentication"
  echo "  • bugfix/login-error"
  echo "  • hotfix/security-patch"
  echo "  • release/v1.2.0"
  echo ""
  exit 1
fi 
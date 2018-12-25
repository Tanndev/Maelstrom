# Contribution Guidelines
## Issues
If you've got an idea or suggestion, feel free to open an issue.
Even if you're planning on making the actual changes yourself, an issue can be a good place to start a discussion. You can always link a Pull Request later, if you make one.

Just follow these guidelines:
- Use the appropriate tags.
- Describe your idea or suggestion in detail, along with why it's important.

## Pull Requests
To suggest changes you've already made, open a pull request.

Just follow these guidelines:
- Use the appropriate tags.
- Reference the issue (if applicable) with the [appropriate keywords](https://help.github.com/articles/closing-issues-using-keywords/).
- For code, be sure to match the surrounding code style.
- For rules/lore, be sure to run a spell checker and generally match the surrounding writing style.

## Commit Conventions
All commits should be in the pattern `type(scope): description`. (Note: the space after the `:` is required.)

Valid types:
 - `rules`: Rule Changes
 - `lore`: Lore Changes
 - `character`: Character Changes
     - Use the character's filename as the scope
 - `feat`: Features
 - `fix`: Fixes
 - `perf`: Performance Improvements
 - `revert`: Reverted Commits
 - `docs`: App documentation changes
 - `style`: Style changes
     - Use `rules` scope for style updates in rules
     - Use `character sheet` scope for updates to character sheet
     - Use `website` scope for other css changes to website
 - `refactor`: Code Refactoring
 - `test`: Tests
 - `build`: Build System
 - `ci`: Continuous Integration

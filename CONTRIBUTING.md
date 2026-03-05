# Contributing to Calendar Simple

First off, thank you for considering contributing to `calendar-simple`! It's people like you that make open-source such a great community to learn, inspire, and create.

## Where do I go from here?

If you've noticed a bug or have a feature request, make one! It's generally best if you get confirmation of your bug or approval for your feature request this way before starting to code.

## Setting up your environment

1. **Fork the repo** and clone it to your local machine:

   ```bash
   git clone https://github.com/YOUR-USERNAME/CalendarSimple.git
   cd CalendarSimple
   ```

2. **Install dependencies**:
   We recommend using `npm` to ensure compatibility.

   ```bash
   npm install
   ```

3. **Run the local environment**:
   The easiest way to develop and test components is via Storybook or the playground application.

   ```bash
   # To run Storybook
   npm run storybook

   # To run the playground (if applicable)
   npm run dev
   ```

## Development Workflow

1. **Create a branch**:
   Create a new branch for your work: `git checkout -b feature/your-feature-name` or `fix/your-fix-name`.

2. **Make your changes**:
   Write your code, following the existing structure and keeping things consistent (TypeScript, React hooks, CSS Modules).

3. **Commit your changes**:
   We use `semantic-release`. Please write your commit messages following the Conventional Commits specification.
   - `feat: add new schedule view`
   - `fix: resolve timezone rendering bug`
   - `docs: update readme with usage examples`

4. **Verify changes**:
   Make sure everything builds correctly before pushing.

   ```bash
   npm run build
   ```

5. **Push and create a Pull Request**:
   Push your branch and open a PR against the `main` branch.

## Coding Guidelines

- **TypeScript**: This project uses TypeScript. Ensure all new features are strictly typed.
- **CSS**: Use vanilla CSS (or CSS Modules if configured) and follow the snake_case naming convention for folders (e.g., `src/components/schedule_view/`).
- **Documentation**: If you are adding a new prop or feature, please update the `README.md` and `DOCUMENTATION.md` files accordingly.

Thank you for contributing!

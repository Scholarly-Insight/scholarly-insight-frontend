# Scholarly Insight

Scholarly Insight is a web application that allows users to search, browse, and stay updated with scholarly articles across various scientific disciplines provided by the arXiv API.

## Features

- **Search and Browse**: Search and browse articles using author, category, and publication date filters
- **Article Details**: Display detailed article information, including abstracts and links to full papers
- **User Accounts**: Create accounts to save favorite articles, set up alerts for new publications, and track reading history
- **AI Insights**: Get AI-generated summaries and key points for research papers
- **Discussion**: Discuss articles and share insights with other researchers

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Routing**: React Router
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **API Integration**: arXiv API

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Bun (v1.0 or higher)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/scholarly-insight.git
cd scholarly-insight
```

2. Install dependencies
```bash
bun install
```

3. Set up Firebase
   - Create a Firebase project
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Add your Firebase configuration to `src/services/firebase.ts`

4. Start the development server
```bash
bun run dev
```

## Build and Deploy

To build the project for production:

```bash
bun run build
```

The build output will be in the `dist` directory.

## Project Structure

- `/src/components`: UI components
- `/src/pages`: Page components
- `/src/services`: API and Firebase services
- `/src/types`: TypeScript type definitions
- `/src/router`: Routing configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [arXiv API](https://info.arxiv.org/help/api/index.html) for providing access to scientific papers
- [Firebase](https://firebase.google.com/) for authentication and database services
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React Router](https://reactrouter.com/) for routing
- [TypeScript](https://www.typescriptlang.org/) for type safety

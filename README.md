CharitiesNextToMe A social media-style platform for discovering local Canadian charities through feed and map interfaces.

Features User Authentication: Secure sign-in with Supabase Auth Social Feed: Instagram-style feed showing charity posts with like and follow functionality Interactive Map: Google Maps-style interface showing charity locations with hover information Search & Filter: Search charities by Canadian cities with autocomplete and filter by category Responsive Design: Mobile-friendly interface with modern UI components Tech Stack Frontend: Next.js, Vite, TypeScript, Tailwind CSS: Express.js, Node.js Database: Postgres Build Tool: Vite Color Scheme Primary Red: 
#E53935 (charity red) Map Blue: 
#2196F3 (map interface) Action Green: 
#4CAF50 (donate buttons) Background: 
#FFFFFF (clean white) Text: 
#212121 (dark grey) Typography Headers: Poppins Body Text: Inter System fonts for map elements Getting Started Clone the repository Install dependencies: npm install Set up Postgres database Configure environment variables Run development server: npm run dev Database Setup The application uses Postgres with the following main tables:

users - User accounts and profiles charities - Charity organization data posts - Social media posts from charities follows - User-charity follow relationships post_likes - Post like interactions canadian_cities - Canadian city data for search Environment Variables DATABASE_URL - Postgres connection string HTTP APIs Supabase Development The project follows modern full-stack patterns:

Frontend handles UI and user interactions Backend provides API endpoints and data persistence Real-time updates through optimistic UI patterns Responsive design for mobile and desktop Contributing This platform connects Canadians with local charitable organizations, making it easier to discover and support causes in their communities.

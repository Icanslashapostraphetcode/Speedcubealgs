# SpeedCube Timer

A minimalistic, modern speedcubing timer with account management, statistics tracking, and a contact system. Built with Node.js, Express, and SQLite.

## Features

- **3x3 Scramble Generator** - Generates random WCA cube scrambles (25 moves)
- **Spacebar Timer** - Hold spacebar for 0.3 seconds to start the timer, release to stop
- **WCA 15-Second Inspection Toggle** - Toggle inspection mode with countdown display and +2 penalty warning
- **Accounts** - Create accounts to save and track all your solving statistics
- **Statistics**
  - Personal Best (PB)
  - Worst Time
  - Average of 5 (Ao5)
  - Average of 12 (Ao12)
  - Complete solve history with time display
- **Contact Page** - Submit feedback and messages directly through the app
- **Session Tracking** - Local session stats saved in browser localStorage
- **GUI** - Clean, easy-to-read interface optimized for speed cubing
- **Multiple Device Design** - Works on desktop and mobile devices

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/speedcubing-timer.git
cd speedcubing-timer
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### Development Mode

To run with automatic reload on file changes:
```bash
npm run dev
```

(Requires nodemon to be installed)

## Usage

### Timer Page
1. **View Scramble** - The current scramble is displayed at the top
2. **Generate New Scramble** - Click "New Scramble" button to get a different scramble
3. **Enable Inspection** - Check "WCA 15-second Inspection" in Settings for official mode
4. **Start Timing**:
   - Hold spacebar down for 0.3 seconds
   - Timer will become ready (visual feedback provided)
   - Release spacebar to start the timer
5. **Stop Timing** - Release spacebar while timer is running to record your time
6. **View Stats** - Your session statistics update automatically

### Account Management
- **Sign Up** - Create a new account with username, email, and password
- **Login** - Access your saved statistics and history
- **View Profile** - See your personal records and recent solves
- **Logout** - Clear your session

### Contact
- **Send Message** - Use the contact form to send feedback or report issues
- Messages are stored in the database with your name, email, subject, and message

## Project Structure

```
speedcubing-timer/
├── public/                 # Frontend files
│   ├── index.html         # Main timer page
│   ├── account.html       # Account/profile page
│   ├── contact.html       # Contact form page
│   ├── styles.css         # Styling for all pages
│   ├── script.js          # Timer and scramble logic
│   ├── account.js         # Account management
│   └── contact.js         # Contact form handling
├── server/
│   └── server.js          # Express.js backend server
├── package.json           # Project dependencies
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Solve Times Table
```sql
CREATE TABLE solve_times (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    time REAL NOT NULL,
    scramble TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
```

### Contact Messages Table
```sql
CREATE TABLE contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Configuration

Edit the `.env` file to customize settings:

```env
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
```

**Important**: Change `JWT_SECRET` to a strong random string before deploying to production.

## Technologies Used

- **Frontend**
  - HTML5
  - CSS3 (with CSS variables for theming)
  - Vanilla JavaScript (no dependencies)

- **Backend**
  - Node.js
  - Express.js (web framework)
  - SQLite3 (database)
  - bcryptjs (password hashing)
  - jsonwebtoken (JWT authentication)
  - CORS (cross-origin support)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login to existing account

### Statistics
- `POST /api/stats/save` - Save a new solve time (requires auth)
- `GET /api/stats/user` - Get user statistics (requires auth)

### Contact
- `POST /api/contact` - Submit a contact message

## UI Design

The interface uses a minimalistic design with:
- Clean, dark navigation bar
- Organized grid layout
- Large, easy-to-read timer display
- Responsive cards for stats and information
- Color-coded elements (warnings in red, successes in green)
- Minimal color palette (dark, white, blue accent)

## Security Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 7 days
- Change the `JWT_SECRET` in production
- Database file should not be publicly accessible

## Future Enhancements

- [ ] Email notifications for contact messages
- [ ] Leaderboard system (global/friends)
- [ ] Dark mode toggle
- [ ] Multiple puzzle types (2x2, 4x4, 5x5, etc.)
- [ ] Statistics graphs and charts
- [ ] Cube scramble visualization
- [ ] Replay functionality for solves
- [ ] Solve recording (video integration)
- [ ] Mobile app version
- [ ] Discord bot integration

## Troubleshooting

### Timer not responding to spacebar
- Ensure the page has focus (click on the page first)
- Check browser console for any JavaScript errors
- Try refreshing the page

### Database connection error
- Ensure SQLite3 is properly installed: `npm install sqlite3`
- Check that the `/server` directory exists and is writable

### Account login issues
- Verify email and password are correct
- Make sure cookies/storage are not blocked in browser
- Clear browser cache and try again



## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Contact & Support

For issues, questions, or suggestions, please:
1. Use the Contact page in the app
2. Open an issue on GitHub
3. Submit a pull request with your improvements

---

** Happy Cubing! **

*Last Updated: January 17, 2026*

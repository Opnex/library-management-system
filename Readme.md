
📚 Library Book Borrowing System
🎯 Objective
The goal of this project is to develop a responsive, front-end-only Library Book Borrowing System using HTML, CSS (or Bootstrap), and JavaScript. Users will be able to browse, search, and borrow books, while librarians can view basic borrowing analytics — all powered by local storage.

📦 Key Functional Modules
1. 📖 Book Catalog
Display a visually appealing catalog of books.


Each book should show:


Title


Author


Genre


Availability (Available / Borrowed)


Cover image


Include search functionality (by title or author).


Add filter options (by genre or availability).


Use local storage to store and update the book list.



2. 📝 Borrowing System
Users can borrow books using a simple form (name, email, select book).


Validate form inputs (e.g., required fields, email format).


Show a confirmation message and a due date (e.g., 7 days from borrowing).


Change the book status to “Borrowed” after successful borrowing.


Prevent users from borrowing books that are already taken.


Store borrowing activity in localStorage.



3. 📚 Borrowing History
Allow users to view books they’ve borrowed and due dates.


Option to return a book, which updates its status back to "Available".


Persist history using localStorage.



4. 📊 Librarian Dashboard
Track and display basic analytics like:


Total books borrowed


Total available


Most borrowed books


Genre distribution


Display analytics using Chart.js or a basic HTML table/chart layout.



✅ Functional Requirements Checklist
Build using HTML, CSS (& Bootstrap(!important)), and Vanilla JavaScript only.


Fully responsive layout (desktop, tablet, mobile).


Real-time form validation for borrowing.


Interactive search, filter, and sort functionality.


Borrowing system with local storage persistence.


Simple analytics dashboard for visual insight.


Clear and user-friendly UI/UX design.



🚀 Bonus Challenges (Optional but counts if implemented)
Add a "Wishlist" feature for users to mark books.


Enable light/dark mode toggle.


Export borrowing history as a CSV file.


Add a reset button to clear localStorage for testing purposes.



📌 Submission Guidelines
Host the project on GitHub and submit a public repo link here.


Include a README.md file with:


Project description


Screenshots


How to run/test the project



💡 Tips
Use tools like FontAwesome for icons.


Use Chart.js for charts.


Focus on clean layout, data handling, and user feedback.





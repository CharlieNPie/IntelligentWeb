# IntelligentWeb

90% minimum

## Currently done [Borja]

- Created all views and simplified EJS using partials for head and footer.
- Styled everything inspired by instagram on public/styles/styles.css

Pages:

- Home (index)
  All the UI is nice and ready.
  Button on top right takes the user to the new event creation page.
  Footer with links to Home | Explore | Profile.
  Trending row is actually pulling events out of IDB and creating elements for each of them.
  Top image and other rows are hardcoded and can easily pull content from DB working like Trending does.

- Event Page (event)
  Top menu contains 3 sections:
  - Back button to go back to the index page.
  - Event name pulled from DB.
  - New post button that will take the user to the post creation page.
    Under that, image and description of the event are showed, again, pulled from DB.
    Then we have the menu, which shows:
  - Posts feed (pulling posts from DB)
    - Like functionality (users can like the posts - right now, this gets saved on localStorage)
    - Comments section
      - Pulls comments from DB
      - Let's the user add a new comment to a post
    - Displays: Image, Description, Date, Username, User avatar
  - Map (shows posts by location) [not done yet - pending Hasans implementation on Explore page]
    Displays a map where each post has a representative marker
  - Edit event (only users with permissions should see it - when we have users)
    Takes the user to the edit event page where they can modify the event

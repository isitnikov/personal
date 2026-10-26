# Personal page

A static website with no build step or dependencies. Open `index.html` directly in a browser or deploy the files to a static host. Configure the host to serve `404.html` for unknown URLs. The script also displays the error screen when the host falls back to the home page for an unknown path.

## Transitions

Sections overlap inside a sticky, full-screen stage. Scrolling dissolves adjacent frames without horizontal movement. Menu links dissolve directly to the selected frame over 850 ms without showing intermediate sections. The system's reduced-motion setting disables the dissolve.

## Photos

Portraits are stored in `images/`:

- `home.png`: smiling, positioned on the right.
- `about.png`: welcoming gesture, positioned on the left.
- `resume.png`: professional portrait on the right, with text on the left.
- `contact.png`: vintage telephone portrait on the left.
- `404-vito.png`: Vito Corleone meme portrait.

Photos are cropped to cover the viewport. Gradient backgrounds are used if images are unavailable.

## Contacts

Contact links and inline SVG icons are defined in `index.html`. Email uses a `mailto:` link; Facebook and LinkedIn open in new tabs. All contact links work without JavaScript.

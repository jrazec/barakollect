# FOLDER MANAGEMENT

> src/
> ├── assets/            # Images, > global CSS, fonts
> │   └── styles/
> │       └── globals.css
> │
> ├── components/        # Reusable UI > (Navbar, Buttons, Modals)
> │   └── Navbar.jsx
> │   └── Sidebar.jsx
> │
> ├── pages/             # Route-based > views (Login, Dashboard)
> │   └── Login.jsx
> │   └── AdminDashboard.jsx
> │
> ├── layouts/           # Shared > layouts (Header + Sidebar shell)
> │   └── AdminLayout.jsx
> │
> ├── routes/            # All routes > declared here
> │   └── index.jsx
> │
> ├── services/            # All api calls are put in here
> │   └── api.js
> │
> ├── App.jsx            # Root > component
> ├── main.jsx           # Entry point > (ReactDOM)
> └── index.css          # Entry point > CSS (can import globals here)


## Backend
- source .venv/bin/activate
> activate the venv first
- pip install django djangorestframework django-cors-headers djangorestframework-simplejwt python-decouple
> for packages



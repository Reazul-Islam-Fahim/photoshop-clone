
# Photoshop Clone Web App

This is a simple Photoshop-like web application with layered image editing features.

---

## Features

- Upload an image to create a new project
- Add multiple shapes (circles, lines) as layers
- Each shape is saved as a separate layer
- Undo/Redo support
- Transform/Resize layers using mouse
- Change fill/stroke colors on selected layers
- Save new layers and update existing ones to backend

---

## Tech Stack

- Frontend: React, React Konva
- Backend: Django REST Framework, MySQL
- Database: MySQL

---

## Setup Instructions

### Backend

1. Navigate to the `backend` directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Create a virtual environment and activate it:
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   venv\\Scripts\\activate     # Windows
   \`\`\`

3. Install requirements:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. Configure MySQL database settings in `photoshop_clone/settings.py`:
   \`\`\`python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.mysql',
           'NAME': 'YOUR_DB_NAME',
           'USER': 'YOUR_DB_USER',
           'PASSWORD': 'YOUR_DB_PASSWORD',
           'HOST': 'localhost',
           'PORT': '3306',
       }
   }
   \`\`\`

5. Apply migrations:
   \`\`\`bash
   python manage.py migrate
   \`\`\`

6. Run the development server:
   \`\`\`bash
   python manage.py runserver
   \`\`\`

### Frontend

1. Navigate to the `frontend` directory:
   \`\`\`bash
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the React app:
   \`\`\`bash
   npm start
   \`\`\`

4. Open your browser and visit [http://localhost:3000](http://localhost:3000)

---

## Notes

- Backend API runs on port 8000
- Frontend React app runs on port 3000
- The backend allows CORS from all origins for dev convenience
- Remember to upload an initial image when creating a new project to start editing
- Shapes are saved as layers tied to the uploaded image

---

## Future Improvements

- Add support for more shapes (rectangle, polygons, text)
- Implement layer visibility toggling and reordering
- Add user authentication and project management
- Support exporting final images
- Enhance UI/UX

---

## License

MIT License

---

Created by Your Name

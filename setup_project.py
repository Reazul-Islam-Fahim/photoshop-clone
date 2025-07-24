import os

print("Script started running...")


project_files = {
    # Backend files
    "backend/photoshop_clone/settings.py": """
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'your-secret-key'
DEBUG = True
ALLOWED_HOSTS = []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'editor',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'photoshop_clone.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'photoshop_clone.wsgi.application'

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

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = True
""",

    "backend/photoshop_clone/urls.py": """
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('editor.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
""",

    "backend/manage.py": """
#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'photoshop_clone.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django."
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
""",

    "backend/editor/models.py": """
from django.db import models

class Project(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Image(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='image')
    title = models.CharField(max_length=100)
    image_file = models.ImageField(upload_to='images/')
    created_at = models.DateTimeField(auto_now_add=True)

class Layer(models.Model):
    image = models.ForeignKey(Image, on_delete=models.CASCADE, related_name='layers')
    layer_id = models.IntegerField()
    shape_type = models.CharField(max_length=50)
    properties = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
""",

    "backend/editor/serializers.py": """
from rest_framework import serializers
from .models import Project, Image, Layer

class LayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Layer
        fields = '__all__'

class ImageSerializer(serializers.ModelSerializer):
    layers = LayerSerializer(many=True, read_only=True)

    class Meta:
        model = Image
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    image = ImageSerializer(read_only=True)

    class Meta:
        model = Project
        fields = '__all__'

class ProjectCreateSerializer(serializers.ModelSerializer):
    image_file = serializers.ImageField(write_only=True)

    class Meta:
        model = Project
        fields = ['title', 'description', 'image_file']

    def create(self, validated_data):
        image_file = validated_data.pop('image_file')
        project = Project.objects.create(**validated_data)
        Image.objects.create(project=project, title=f"{project.title} Image", image_file=image_file)
        return project
""",

    "backend/editor/views.py": """
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project, Image, Layer
from .serializers import ProjectSerializer, ImageSerializer, LayerSerializer, ProjectCreateSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    @action(detail=False, methods=['post'], url_path='upload')
    def upload_project_with_image(self, request):
        serializer = ProjectCreateSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.save()
            return Response(ProjectSerializer(project).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer

class LayerViewSet(viewsets.ModelViewSet):
    queryset = Layer.objects.all()
    serializer_class = LayerSerializer
""",

    "backend/editor/urls.py": """
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ImageViewSet, LayerViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'images', ImageViewSet)
router.register(r'layers', LayerViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
""",

    "backend/requirements.txt": """
Django>=4.0
djangorestframework
mysqlclient
Pillow
django-cors-headers
""",

    "backend/__init__.py": "",
    "backend/photoshop_clone/__init__.py": "",
    "backend/photoshop_clone/asgi.py": """
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'photoshop_clone.settings')

application = get_asgi_application()
""",

    "backend/photoshop_clone/wsgi.py": """
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'photoshop_clone.settings')

application = get_wsgi_application()
""",

    "backend/editor/__init__.py": "",
    "backend/editor/admin.py": """
from django.contrib import admin
from .models import Project, Image, Layer

admin.site.register(Project)
admin.site.register(Image)
admin.site.register(Layer)
""",

    "backend/editor/apps.py": """
from django.apps import AppConfig

class EditorConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'editor'
""",

    # Frontend files

    "frontend/package.json": """
{
  "name": "photoshop-client",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "axios": "^1.4.0",
    "konva": "^8.4.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-konva": "^18.0.4",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4",
    "use-image": "^1.0.0"
  },
  "scripts": {
    "start": "PORT=3000 react-scripts start",
    "build": "react-scripts build"
  }
}
""",

    "frontend/public/index.html": """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Photoshop Clone</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
""",

    "frontend/src/index.js": """
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
""",

    "frontend/src/App.js": """
import React, { useState } from 'react';
import UploadProject from './components/UploadProject';
import CanvasEditor from './components/CanvasEditor';

function App() {
  const [project, setProject] = useState(null);

  return (
    <div className="App" style={{ padding: 20 }}>
      <h2>Photoshop Clone</h2>
      {!project ? (
        <UploadProject onUploadSuccess={setProject} />
      ) : (
        <CanvasEditor project={project} />
      )}
    </div>
  );
}

export default App;
""",

    "frontend/src/api/index.js": """
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

export default API;
""",

    "frontend/src/components/UploadProject.js": """
import React, { useState } from 'react';
import axios from '../api';

const UploadProject = ({ onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Choose a file');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', desc);
    formData.append('image_file', file);

    try {
      const res = await axios.post('/projects/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Uploaded successfully');
      onUploadSuccess(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to upload');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
      <h3>Create New Project</h3>
      <input
        type="text"
        placeholder="Project Title"
        onChange={(e) => setTitle(e.target.value)}
        required
        style={{ width: '100%', marginBottom: 10 }}
      />
      <textarea
        placeholder="Description"
        onChange={(e) => setDesc(e.target.value)}
        style={{ width: '100%', height: 80, marginBottom: 10 }}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        required
        style={{ marginBottom: 10 }}
      />
      <br />
      <button type="submit">Upload</button>
    </form>
  );
};

export default UploadProject;
""",

    "frontend/src/components/CanvasEditor.js": """
import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Circle, Line, Transformer } from 'react-konva';
import useImage from 'use-image';
import axios from '../api';

const CanvasEditor = ({ project }) => {
  const stageRef = useRef();
  const transformerRef = useRef();
  const [imageURL, setImageURL] = useState(null);
  const [bgImage] = useImage(imageURL);
  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [drawingMode, setDrawingMode] = useState(null);
  const [tempLinePoints, setTempLinePoints] = useState([]);

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`/projects/${project.id}/`);
      const imageFile = res.data.image.image_file;
      setImageURL(`http://localhost:8000${imageFile}`);

      const layers = res.data.image.layers;
      const parsedShapes = layers.map(layer => ({
        id: layer.id,
        type: layer.shape_type,
        ...layer.properties,
        isNew: false,
      }));
      setShapes(parsedShapes);
    };

    fetchData();
  }, [project]);

  const pushToUndo = () => {
    setUndoStack(prev => [...prev, shapes.map(s => ({ ...s }))]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prevShapes = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, shapes]);
    setUndoStack(prev => prev.slice(0, -1));
    setShapes(prevShapes);
    setSelectedId(null);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const nextShapes = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, shapes]);
    setRedoStack(prev => prev.slice(0, -1));
    setShapes(nextShapes);
    setSelectedId(null);
  };

  const addCircle = () => {
    pushToUndo();
    const newShape = {
      id: `temp-${shapes.length + 1}`,
      type: 'circle',
      x: Math.random() * 300 + 50,
      y: Math.random() * 300 + 50,
      radius: 40,
      fill: 'red',
      isNew: true,
    };
    setShapes([...shapes, newShape]);
  };

  const handleCanvasClick = (e) => {
    if (drawingMode === 'line') {
      const stage = stageRef.current.getStage();
      const pointer = stage.getPointerPosition();
      const newPoints = [...tempLinePoints, pointer.x, pointer.y];

      if (newPoints.length === 4) {
        pushToUndo();
        const newLine = {
          id: `temp-${shapes.length + 1}`,
          type: 'line',
          points: newPoints,
          stroke: 'blue',
          strokeWidth: 3,
          isNew: true,
        };
        setShapes([...shapes, newLine]);
        setTempLinePoints([]);
        setDrawingMode(null);
      } else {
        setTempLinePoints(newPoints);
      }
    }
  };

  const changeColor = async (newColor) => {
    if (!selectedId) return;
    pushToUndo();

    const updated = shapes.map((shape) => {
      if (shape.id === selectedId) {
        if (shape.type === 'circle') return { ...shape, fill: newColor };
        if (shape.type === 'line') return { ...shape, stroke: newColor };
      }
      return shape;
    });
    setShapes(updated);

    if (typeof selectedId === 'number') {
      const shapeToUpdate = updated.find(s => s.id === selectedId);
      try {
        const properties = {...shapeToUpdate};
        delete properties.id;
        delete properties.type;
        delete properties.isNew;
        await axios.patch(`/layers/${selectedId}/`, { properties });
      } catch (err) {
        console.error('Failed to update color', err);
      }
    }
  };

  const saveNewLayers = async () => {
    const imageId = project.image.id;
    const newLayers = shapes.filter(s => s.isNew);

    for (let i = 0; i < newLayers.length; i++) {
      const shape = newLayers[i];
      const payload = {
        image: imageId,
        layer_id: i + 1,
        shape_type: shape.type,
        properties: shape.type === 'circle' ? {
          x: shape.x,
          y: shape.y,
          radius: shape.radius,
          fill: shape.fill,
        } : {
          points: shape.points,
          stroke: shape.stroke,
          strokeWidth: shape.strokeWidth,
        },
      };
      try {
        const res = await axios.post('/layers/', payload);
        setShapes(prev => prev.map(s => s.id === shape.id ? {...res.data, isNew: false} : s));
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
    alert('New layers saved!');
  };

  const updateShape = async (id, updates) => {
    pushToUndo();

    setShapes(prevShapes =>
      prevShapes.map(shape =>
        shape.id === id ? { ...shape, ...updates } : shape
      )
    );

    if (typeof id === 'number') {
      try {
        const shapeToUpdate = shapes.find(s => s.id === id);
        if (!shapeToUpdate) return;

        let properties = {...shapeToUpdate, ...updates};
        delete properties.id;
        delete properties.type;
        delete properties.isNew;

        await axios.patch(`/layers/${id}/`, { properties });
      } catch (err) {
        console.error('Failed to update layer:', err);
      }
    }
  };

  const handleDragEnd = (e, id) => {
    const { x, y } = e.target.position();
    updateShape(id, { x, y });
  };

  const handleTransformEnd = (e, id) => {
    const node = e.target;
    let updates = {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
    };

    if (node.className === 'Circle') {
      updates.radius = node.radius() * node.scaleX();
    } else if (node.className === 'Line') {
      const oldPoints = node.points();
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      updates.points = oldPoints.map((p, i) =>
        i % 2 === 0 ? p * scaleX : p * scaleY
      );
    }
    node.scaleX(1);
    node.scaleY(1);

    updateShape(id, updates);
  };

  useEffect(() => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;
    if (!selectedId) {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
      return;
    }
    const selectedNode = stage.findOne(`#${selectedId.toString()}`);
    if (selectedNode) {
      transformer.nodes([selectedNode]);
      transformer.getLayer()?.batchDraw();
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedId, shapes]);

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={addCircle}>Add Circle</button>
        <button onClick={() => setDrawingMode('line')}>Start Line</button>
        <button onClick={() => changeColor('yellow')}>Change Color to Yellow</button>
        <button onClick={saveNewLayers}>Save New Layers</button>
        <button onClick={undo} disabled={undoStack.length === 0}>Undo</button>
        <button onClick={redo} disabled={redoStack.length === 0}>Redo</button>
      </div>

      <Stage
        width={800}
        height={600}
        ref={stageRef}
        onMouseDown={handleCanvasClick}
        style={{ border: '1px solid #ccc' }}
      >
        <Layer>
          {bgImage && <KonvaImage image={bgImage} width={800} height={600} />}
        </Layer>

        <Layer>
          {shapes.map(shape => {
            if (shape.type === 'circle') {
              return (
                <Circle
                  key={shape.id}
                  id={shape.id.toString()}
                  x={shape.x}
                  y={shape.y}
                  radius={shape.radius}
                  fill={shape.fill}
                  draggable
                  rotation={shape.rotation || 0}
                  onClick={() => setSelectedId(shape.id)}
                  onTap={() => setSelectedId(shape.id)}
                  onDragEnd={e => handleDragEnd(e, shape.id)}
                  onTransformEnd={e => handleTransformEnd(e, shape.id)}
                  perfectDrawEnabled={false}
                />
              );
            } else if (shape.type === 'line') {
              return (
                <Line
                  key={shape.id}
                  id={shape.id.toString()}
                  points={shape.points}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  draggable
                  rotation={shape.rotation || 0}
                  onClick={() => setSelectedId(shape.id)}
                  onTap={() => setSelectedId(shape.id)}
                  onDragEnd={e => handleDragEnd(e, shape.id)}
                  onTransformEnd={e => handleTransformEnd(e, shape.id)}
                  perfectDrawEnabled={false}
                />
              );
            }
            return null;
          })}
        </Layer>

        <Layer>
          <Transformer
            ref={transformerRef}
            rotateEnabled={true}
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasEditor;
""",

        "README.md": r"""
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
""",

}




for filepath, content in project_files.items():
    full_path = os.path.join(os.getcwd(), filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Project files created successfully!")
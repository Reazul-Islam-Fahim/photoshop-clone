import { HexColorPicker } from 'react-colorful';
import axios from 'axios';

const Sidebar = ({
  selectedColor,
  setSelectedColor,
  handleAddCircle,
  shapes,
  setShapes,
  imageId,
  fetchLayers,
}) => {
  const saveNewLayers = async () => {
    const newLayers = shapes.filter(s => s.isNew);

    for (let i = 0; i < newLayers.length; i++) {
      const shape = newLayers[i];
      const payload = {
        image: imageId,
        layer_id: i + 1,
        shape_type: shape.type,
        properties: shape.type === 'circle'
          ? {
              x: shape.x,
              y: shape.y,
              radius: shape.radius,
              fill: shape.fill,
            }
          : {
              points: shape.points,
              stroke: shape.stroke,
              strokeWidth: shape.strokeWidth,
            },
      };

      try {
        const res = await axios.post('/layers/', payload);
        setShapes(prev =>
          prev.map(s =>
            s.id === shape.id ? { ...res.data, isNew: false } : s
          )
        );
      } catch (err) {
        console.error('Save failed:', err);
      }
    }

    await fetchLayers();
    alert('New layers saved and refreshed!');
  };

  return (
    <div className="w-64 p-4 border border-gray-300 bg-white space-y-4">
      <h2 className="text-lg font-bold">Tools</h2>

      <div>
        <label className="font-medium">Color Picker:</label>
        <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
        <div className="mt-2">Selected: <span style={{ color: selectedColor }}>{selectedColor}</span></div>
      </div>

      <button
        onClick={handleAddCircle}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Add Circle
      </button>

      <button
        onClick={saveNewLayers}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        Save Layers
      </button>
    </div>
  );
};

export default Sidebar;

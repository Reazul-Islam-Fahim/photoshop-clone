// import React, { useEffect, useState, useRef } from "react";
// import {
//   Stage,
//   Layer,
//   Image as KonvaImage,
//   Circle,
//   Line,
//   Transformer,
//   Path,
//   Rect,
//   Ellipse,
// } from "react-konva";
// import useImage from "use-image";
// import axios from "../api";
// import { HexColorPicker } from "react-colorful";
// import UploadImage from "./UploadImage";

// const CanvasEditor = ({ project }) => {
//   const stageRef = useRef(null);
//   const transformerRef = useRef(null);
//   const [imageURL, setImageURL] = useState(null);
//   const [imageID, setImageID] = useState(null);
//   const [bgImage] = useImage(imageURL || "");
//   const [shapes, setShapes] = useState([]);
//   const [selectedId, setSelectedId] = useState(null);
//   const [mode, setMode] = useState("select");
//   const [tempPoints, setTempPoints] = useState([]);
//   const [undoStack, setUndoStack] = useState([]);
//   const [redoStack, setRedoStack] = useState([]);
//   const [color, setColor] = useState("#ff0000");
//   const [brushSize, setBrushSize] = useState(5);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [brushPath, setBrushPath] = useState("");
//   const [selectedAnchorIndex, setSelectedAnchorIndex] = useState(null);
//   const [isCreating, setIsCreating] = useState(false);
//   const [eraserPath, setEraserPath] = useState("");
//   const [isErasing, setIsErasing] = useState(false);
//   const [hasImage, setHasImage] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   const shapeTypes = {
//     SELECT: "select",
//     BRUSH: "brush",
//     POLYGON: "polygon",
//     CIRCLE: "circle",
//     LINE: "line",
//     RECTANGLE: "rectangle",
//     TRIANGLE: "triangle",
//     OVAL: "oval",
//     PATH: "path",
//     ERASER: "eraser",
//   };

//   const fetchData = async () => {
//     try {
//       setIsLoading(true);
//       const res = await axios.get(`/projects/${project.id}/`);
//       const imageData = res.data.image;

//       if (imageData && imageData.image_file) {
//         setImageURL(imageData.image_file);
//         setImageID(imageData.id);
//         setHasImage(true);

//         const layers = imageData.layers || [];
//         const parsedShapes = layers.map((layer, index) => {
//           const shape = {
//             id: layer.id,
//             type: layer.shape_type,
//             ...layer.properties,
//             isNew: false,
//             stroke:
//               layer.properties.stroke || layer.properties.fill || "#ff0000",
//             strokeWidth: layer.properties.strokeWidth || 2,
//             zIndex: index,
//           };

//           if (layer.shape_type === "triangle" && !layer.properties.points) {
//             shape.points = [
//               layer.properties.x || 0,
//               layer.properties.y || 0,
//               (layer.properties.x || 0) - 30,
//               (layer.properties.y || 0) + 50,
//               (layer.properties.x || 0) + 30,
//               (layer.properties.y || 0) + 50,
//             ];
//             shape.x = 0;
//             shape.y = 0;
//           }
//           return shape;
//         });
//         setShapes(parsedShapes);
//       } else {
//         setHasImage(false);
//       }
//     } catch (error) {
//       console.error("Failed to fetch project data", error);
//       setHasImage(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (project) {
//       fetchData();
//     }
//   }, [project]);

//   const handleUploadSuccess = (imageData) => {
//     setImageURL(imageData.image_file);
//     setImageID(imageData.id);
//     setHasImage(true);
//     fetchData();
//   };

//   const pushToUndo = () => {
//     setUndoStack((prev) => [...prev, shapes.map((s) => ({ ...s }))]);
//     setRedoStack([]);
//   };

//   const undo = () => {
//     if (undoStack.length === 0) return;
//     const prevShapes = undoStack[undoStack.length - 1];
//     setRedoStack((prev) => [...prev, shapes]);
//     setUndoStack((prev) => prev.slice(0, -1));
//     setShapes(prevShapes);
//     setSelectedId(null);
//   };

//   const redo = () => {
//     if (redoStack.length === 0) return;
//     const nextShapes = redoStack[redoStack.length - 1];
//     setUndoStack((prev) => [...prev, shapes]);
//     setRedoStack((prev) => prev.slice(0, -1));
//     setShapes(nextShapes);
//     setSelectedId(null);
//   };

//   const clearCanvas = async () => {
//     const confirmed = window.confirm(
//       "Are you sure you want to clear the canvas? This will remove the background image."
//     );

//     if (confirmed) {
//       try {
//         const res = await axios.delete(
//           `/images/${imageID}/delete-with-layers/`
//         );

//         // Clear local state
//         setImageURL(null);
//         setShapes([]);
//         setUndoStack([]);
//         setRedoStack([]);
//         setSelectedId(null);
//         setTempPoints([]);
//         setBrushPath("");
//         setIsDrawing(false);
//         setMode(shapeTypes.SELECT);

//         // Refresh data
//         await fetchData();
//       } catch (error) {
//         console.error("Failed to clear canvas:", error);
//         alert("Failed to clear canvas. Please try again.");
//       }
//     }
//   };

//   const handleMouseDown = (e) => {
//     if (isCreating || !stageRef.current) return;
//     setIsCreating(true);

//     const stage = stageRef.current.getStage();
//     const pointer = stage.getPointerPosition();

//     if (!pointer) return;

//     if (mode === shapeTypes.POLYGON) {
//       setTempPoints([...tempPoints, pointer.x, pointer.y]);
//     } else if (mode === shapeTypes.BRUSH) {
//       setIsDrawing(true);
//       setBrushPath(`M${pointer.x},${pointer.y}`);
//     } else if (mode === shapeTypes.ERASER) {
//       setIsErasing(true);
//       setEraserPath(`M${pointer.x},${pointer.y}`);
//       eraseAtPosition(pointer);
//     } else if (mode === shapeTypes.CIRCLE) {
//       pushToUndo();
//       const newCircle = {
//         id: `temp-${Date.now()}`,
//         type: shapeTypes.CIRCLE,
//         x: pointer.x,
//         y: pointer.y,
//         radius: 30,
//         fill: color,
//         stroke: color,
//         strokeWidth: 2,
//         isNew: true,
//         zIndex: shapes.length,
//       };
//       setShapes([...shapes, newCircle]);
//       setSelectedId(newCircle.id);
//     } else if (mode === shapeTypes.LINE) {
//       pushToUndo();
//       const newLine = {
//         id: `temp-${Date.now()}`,
//         type: shapeTypes.LINE,
//         points: [pointer.x, pointer.y, pointer.x, pointer.y],
//         stroke: color,
//         strokeWidth: brushSize,
//         isNew: true,
//         zIndex: shapes.length,
//       };
//       setShapes([...shapes, newLine]);
//       setSelectedId(newLine.id);
//     } else if (mode === shapeTypes.RECTANGLE) {
//       pushToUndo();
//       const newRect = {
//         id: `temp-${Date.now()}`,
//         type: shapeTypes.RECTANGLE,
//         x: pointer.x,
//         y: pointer.y,
//         width: 50,
//         height: 50,
//         fill: color,
//         stroke: color,
//         strokeWidth: 2,
//         isNew: true,
//         zIndex: shapes.length,
//       };
//       setShapes([...shapes, newRect]);
//       setSelectedId(newRect.id);
//     } else if (mode === shapeTypes.TRIANGLE) {
//       pushToUndo();
//       const newTriangle = {
//         id: `temp-${Date.now()}`,
//         type: shapeTypes.TRIANGLE,
//         points: [
//           pointer.x,
//           pointer.y,
//           pointer.x - 30,
//           pointer.y + 50,
//           pointer.x + 30,
//           pointer.y + 50,
//         ],
//         fill: color,
//         stroke: color,
//         strokeWidth: 2,
//         isNew: true,
//         zIndex: shapes.length,
//         x: 0,
//         y: 0,
//       };
//       setShapes([...shapes, newTriangle]);
//       setSelectedId(newTriangle.id);
//     } else if (mode === shapeTypes.OVAL) {
//       pushToUndo();
//       const newOval = {
//         id: `temp-${Date.now()}`,
//         type: shapeTypes.OVAL,
//         x: pointer.x,
//         y: pointer.y,
//         radiusX: 40,
//         radiusY: 20,
//         fill: color,
//         stroke: color,
//         strokeWidth: 2,
//         isNew: true,
//         zIndex: shapes.length,
//       };
//       setShapes([...shapes, newOval]);
//       setSelectedId(newOval.id);
//     } else if (mode === shapeTypes.SELECT && selectedId) {
//       const tr = transformerRef.current;
//       const shape = shapes.find((s) => s.id === selectedId);

//       if (tr && shape && tr.getNodes().length > 0) {
//         const transformerNode = tr.getNodes()[0];
//         if (transformerNode && transformerNode.getChildren) {
//           const anchors = transformerNode.getChildren(
//             (node) => node.getClassName && node.getClassName() === "Anchor"
//           );

//           if (anchors) {
//             const clickedAnchor = anchors.find((anchor) => {
//               const anchorX = anchor.x();
//               const anchorY = anchor.y();
//               const distance = Math.sqrt(
//                 Math.pow(pointer.x - (shape.x + anchorX), 2) +
//                   Math.pow(pointer.y - (shape.y + anchorY), 2)
//               );
//               return distance < 10;
//             });

//             if (clickedAnchor) {
//               const anchorIndex = anchors.indexOf(clickedAnchor);
//               setSelectedAnchorIndex(anchorIndex);
//             }
//           }
//         }
//       }
//     }
//   };

//   const handleMouseMove = (e) => {
//     if (!stageRef.current) return;
//     const stage = stageRef.current.getStage();
//     const pointer = stage.getPointerPosition();

//     if (!pointer) return;

//     if (mode === shapeTypes.BRUSH && isDrawing) {
//       setBrushPath((prev) => `${prev} L${pointer.x},${pointer.y}`);
//     } else if (mode === shapeTypes.ERASER && isErasing) {
//       setEraserPath((prev) => `${prev} L${pointer.x},${pointer.y}`);
//       eraseAtPosition(pointer);
//     } else if (mode === shapeTypes.LINE && selectedId) {
//       const line = shapes.find((s) => s.id === selectedId);
//       if (line) {
//         const newPoints = [...line.points];
//         newPoints[2] = pointer.x;
//         newPoints[3] = pointer.y;
//         updateShape(selectedId, { points: newPoints });
//       }
//     } else if (selectedAnchorIndex !== null && selectedId) {
//       const shape = shapes.find((s) => s.id === selectedId);
//       if (!shape) return;

//       if (
//         shape.type === shapeTypes.POLYGON ||
//         shape.type === shapeTypes.LINE ||
//         shape.type === shapeTypes.TRIANGLE
//       ) {
//         const newPoints = [...shape.points];
//         const pointIndex = selectedAnchorIndex * 2;

//         if (pointIndex < newPoints.length) {
//           newPoints[pointIndex] = pointer.x - (shape.x || 0);
//           newPoints[pointIndex + 1] = pointer.y - (shape.y || 0);
//           updateShape(selectedId, { points: newPoints });
//         }
//       }
//     }
//   };

//   const eraseAtPosition = (position) => {
//     const eraseRadius = brushSize;

//     setShapes((prevShapes) => {
//       return prevShapes.filter((shape) => {
//         const shapeNode = stageRef.current?.findOne(`#${shape.id}`);
//         if (!shapeNode) return true;

//         const tempCircle = new window.Konva.Circle({
//           x: position.x,
//           y: position.y,
//           radius: eraseRadius,
//         });

//         return !shapeNode.intersects(tempCircle.getClientRect());
//       });
//     });
//   };

//   const handleMouseUp = (e) => {
//     setIsCreating(false);

//     if (mode === shapeTypes.BRUSH && isDrawing) {
//       if (brushPath) {
//         pushToUndo();
//         const newShape = {
//           id: `temp-${Date.now()}`,
//           type: shapeTypes.PATH,
//           data: brushPath,
//           stroke: color,
//           strokeWidth: brushSize,
//           isNew: true,
//           zIndex: shapes.length,
//         };
//         setShapes([...shapes, newShape]);
//         setBrushPath("");
//       }
//       setIsDrawing(false);
//     } else if (mode === shapeTypes.ERASER && isErasing) {
//       setIsErasing(false);
//       setEraserPath("");
//     } else if (mode === shapeTypes.LINE) {
//       setSelectedId(null);
//     }
//     setSelectedAnchorIndex(null);
//   };

//   const completePolygon = () => {
//     if (tempPoints.length >= 6) {
//       finalizePolygon();
//     }
//   };

//   const finalizePolygon = () => {
//     if (tempPoints.length < 6) return;

//     pushToUndo();

//     const newPolygon = {
//       id: `temp-${Date.now()}`,
//       type: shapeTypes.POLYGON,
//       points: [...tempPoints],
//       stroke: color,
//       strokeWidth: 2,
//       fill: color,
//       isNew: true,
//       zIndex: shapes.length,
//     };

//     setShapes([...shapes, newPolygon]);
//     setTempPoints([]);
//     setSelectedId(newPolygon.id);
//     setMode(shapeTypes.SELECT);
//   };

//   const cancelPolygon = () => {
//     setTempPoints([]);
//   };

//   const updateShape = async (id, updates) => {
//     setShapes((prevShapes) =>
//       prevShapes.map((shape) =>
//         shape.id === id ? { ...shape, ...updates } : shape
//       )
//     );

//     if (typeof id === "number") {
//       try {
//         const shapeToUpdate = shapes.find((s) => s.id === id);
//         if (!shapeToUpdate) return;

//         let properties = { ...shapeToUpdate, ...updates };
//         delete properties.id;
//         delete properties.type;
//         delete properties.isNew;
//         delete properties.zIndex;

//         await axios.patch(`/layers/${id}/`, { properties });
//       } catch (err) {
//         console.error("Failed to update layer:", err);
//       }
//     }
//   };

//   const handleDragEnd = (e, id) => {
//     const node = e.target;
//     const updates = {
//       x: node.x(),
//       y: node.y(),
//     };

//     if (node.className === "Line" && node.points()) {
//       updates.points = node.points().map((p, i) => {
//         return i % 2 === 0 ? p + node.x() : p + node.y();
//       });
//       updates.x = 0;
//       updates.y = 0;
//     }

//     updateShape(id, updates);
//   };

//   const handleTransformEnd = (e, id) => {
//     const node = e.target;
//     let updates = {
//       x: node.x(),
//       y: node.y(),
//       rotation: node.rotation(),
//     };

//     if (node.className === "Circle") {
//       updates.radius = node.radius() * node.scaleX();
//     } else if (node.className === "Rect") {
//       updates.width = node.width() * node.scaleX();
//       updates.height = node.height() * node.scaleY();
//     } else if (node.className === "Ellipse") {
//       updates.radiusX = node.radiusX() * node.scaleX();
//       updates.radiusY = node.radiusY() * node.scaleY();
//     } else if (node.className === "Line") {
//       const oldPoints = node.points();
//       const scaleX = node.scaleX();
//       const scaleY = node.scaleY();
//       updates.points = oldPoints.map((p, i) =>
//         i % 2 === 0 ? p * scaleX : p * scaleY
//       );
//     }
//     node.scaleX(1);
//     node.scaleY(1);

//     updateShape(id, updates);
//   };

//   const changeSelectedColor = () => {
//     if (!selectedId) return;
//     const shape = shapes.find((s) => s.id === selectedId);
//     if (!shape) return;

//     const updates = { stroke: color };
//     if (shape.type !== shapeTypes.LINE && shape.type !== shapeTypes.PATH) {
//       updates.fill = color;
//     }

//     updateShape(selectedId, updates);
//   };

//   const saveNewLayers = async () => {
//     if (!project?.image?.id) return;

//     const imageId = project.image.id;
//     const newLayers = shapes.filter((s) => s.isNew);

//     for (let i = 0; i < newLayers.length; i++) {
//       const shape = newLayers[i];
//       let properties = { ...shape };

//       if (shape.type === shapeTypes.TRIANGLE) {
//         properties.points = shape.points;
//         properties.x = shape.x || 0;
//         properties.y = shape.y || 0;
//       }

//       delete properties.id;
//       delete properties.type;
//       delete properties.isNew;
//       delete properties.zIndex;

//       const payload = {
//         image: imageId,
//         layer_id: i + 1,
//         shape_type: shape.type,
//         properties,
//       };

//       try {
//         const res = await axios.post("/layers/", payload);
//         setShapes((prev) =>
//           prev.map((s) =>
//             s.id === shape.id
//               ? { ...res.data, isNew: false, zIndex: shapes.length + i }
//               : s
//           )
//         );
//       } catch (err) {
//         console.error("Save failed for shape:", shape, err);
//       }
//     }

//     await fetchData();
//     alert("New layers saved and refreshed!");
//   };

//   useEffect(() => {
//     const stage = stageRef.current;
//     const transformer = transformerRef.current;

//     if (!transformer || !stage) return;

//     if (!selectedId) {
//       transformer.nodes([]);
//       transformer.getLayer()?.batchDraw();
//       return;
//     }

//     const selectedNode = stage.findOne(`#${selectedId.toString()}`);
//     if (selectedNode) {
//       transformer.nodes([selectedNode]);
//       transformer.getLayer()?.batchDraw();
//     } else {
//       transformer.nodes([]);
//       transformer.getLayer()?.batchDraw();
//     }
//   }, [selectedId, shapes]);

//   const renderShape = (shape) => {
//     const commonProps = {
//       key: shape.id,
//       id: shape.id.toString(),
//       draggable: mode === shapeTypes.SELECT,
//       rotation: shape.rotation || 0,
//       onClick: (e) => {
//         if (mode === shapeTypes.SELECT) {
//           setSelectedId(shape.id);
//         } else if (mode === shapeTypes.ERASER) {
//           pushToUndo();
//           setShapes((prev) => prev.filter((s) => s.id !== shape.id));
//           setSelectedId(null);
//           e.cancelBubble = true;
//         }
//       },
//       onTap: (e) => {
//         if (mode === shapeTypes.SELECT) {
//           setSelectedId(shape.id);
//         } else if (mode === shapeTypes.ERASER) {
//           pushToUndo();
//           setShapes((prev) => prev.filter((s) => s.id !== shape.id));
//           setSelectedId(null);
//           e.cancelBubble = true;
//         }
//       },
//       onDragEnd: (e) => handleDragEnd(e, shape.id),
//       onTransformEnd: (e) => handleTransformEnd(e, shape.id),
//       stroke: shape.stroke || shape.fill || color,
//       strokeWidth: shape.strokeWidth || 2,
//     };

//     switch (shape.type) {
//       case shapeTypes.CIRCLE:
//         return (
//           <Circle
//             {...commonProps}
//             x={shape.x}
//             y={shape.y}
//             radius={shape.radius}
//             fill={shape.fill}
//           />
//         );
//       case shapeTypes.LINE:
//         return (
//           <Line
//             {...commonProps}
//             points={shape.points}
//             stroke={shape.stroke}
//             strokeWidth={shape.strokeWidth}
//           />
//         );
//       case shapeTypes.POLYGON:
//       case shapeTypes.TRIANGLE:
//         return (
//           <Line
//             {...commonProps}
//             points={shape.points}
//             fill={shape.fill}
//             closed={true}
//             x={shape.x || 0}
//             y={shape.y || 0}
//           />
//         );
//       case shapeTypes.PATH:
//         return (
//           <Path
//             {...commonProps}
//             data={shape.data}
//             strokeWidth={shape.strokeWidth}
//             lineCap="round"
//             lineJoin="round"
//           />
//         );
//       case shapeTypes.RECTANGLE:
//         return (
//           <Rect
//             {...commonProps}
//             x={shape.x}
//             y={shape.y}
//             width={shape.width}
//             height={shape.height}
//             fill={shape.fill}
//           />
//         );
//       case shapeTypes.OVAL:
//         return (
//           <Ellipse
//             {...commonProps}
//             x={shape.x}
//             y={shape.y}
//             radiusX={shape.radiusX}
//             radiusY={shape.radiusY}
//             fill={shape.fill}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   const sortedShapes = [...shapes].sort(
//     (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
//   );

//   if (isLoading) {
//     return <div>Loading canvas...</div>;
//   }

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         gap: "16px",
//         maxWidth: "800px",
//         margin: "0 auto",
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           flexWrap: "wrap",
//           gap: "8px",
//           padding: "8px",
//           background: "#f0f0f0",
//           borderRadius: "4px",
//           alignItems: "center",
//         }}
//       >
//         <button
//           style={
//             mode === shapeTypes.SELECT
//               ? {
//                   padding: "8px 12px",
//                   background: "#007bff",
//                   color: "white",
//                   border: "1px solid #007bff",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//               : {
//                   padding: "8px 12px",
//                   background: "#fff",
//                   border: "1px solid #ccc",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//           }
//           onClick={() => setMode(shapeTypes.SELECT)}
//         >
//           Select
//         </button>
//         <button
//           style={
//             mode === shapeTypes.BRUSH
//               ? {
//                   padding: "8px 12px",
//                   background: "#007bff",
//                   color: "white",
//                   border: "1px solid #007bff",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//               : {
//                   padding: "8px 12px",
//                   background: "#fff",
//                   border: "1px solid #ccc",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//           }
//           onClick={() => setMode(shapeTypes.BRUSH)}
//         >
//           Brush
//         </button>
//         <button
//           style={
//             mode === shapeTypes.POLYGON
//               ? {
//                   padding: "8px 12px",
//                   background: "#007bff",
//                   color: "white",
//                   border: "1px solid #007bff",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//               : {
//                   padding: "8px 12px",
//                   background: "#fff",
//                   border: "1px solid #ccc",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//           }
//           onClick={() => {
//             setMode(shapeTypes.POLYGON);
//             setTempPoints([]);
//           }}
//         >
//           Polygon
//         </button>
//         <button
//           style={
//             mode === shapeTypes.CIRCLE
//               ? {
//                   padding: "8px 12px",
//                   background: "#007bff",
//                   color: "white",
//                   border: "1px solid #007bff",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//               : {
//                   padding: "8px 12px",
//                   background: "#fff",
//                   border: "1px solid #ccc",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//           }
//           onClick={() => setMode(shapeTypes.CIRCLE)}
//         >
//           Circle
//         </button>
//         <button
//           style={
//             mode === shapeTypes.LINE
//               ? {
//                   padding: "8px 12px",
//                   background: "#007bff",
//                   color: "white",
//                   border: "1px solid #007bff",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//               : {
//                   padding: "8px 12px",
//                   background: "#fff",
//                   border: "1px solid #ccc",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//           }
//           onClick={() => setMode(shapeTypes.LINE)}
//         >
//           Line
//         </button>
//         <button
//           style={
//             mode === shapeTypes.RECTANGLE
//               ? {
//                   padding: "8px 12px",
//                   background: "#007bff",
//                   color: "white",
//                   border: "1px solid #007bff",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//               : {
//                   padding: "8px 12px",
//                   background: "#fff",
//                   border: "1px solid #ccc",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//           }
//           onClick={() => setMode(shapeTypes.RECTANGLE)}
//         >
//           Rectangle
//         </button>
//         <button
//           style={
//             mode === shapeTypes.TRIANGLE
//               ? {
//                   padding: "8px 12px",
//                   background: "#007bff",
//                   color: "white",
//                   border: "1px solid #007bff",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//               : {
//                   padding: "8px 12px",
//                   background: "#fff",
//                   border: "1px solid #ccc",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//           }
//           onClick={() => setMode(shapeTypes.TRIANGLE)}
//         >
//           Triangle
//         </button>
//         <button
//           style={
//             mode === shapeTypes.OVAL
//               ? {
//                   padding: "8px 12px",
//                   background: "#007bff",
//                   color: "white",
//                   border: "1px solid #007bff",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//               : {
//                   padding: "8px 12px",
//                   background: "#fff",
//                   border: "1px solid #ccc",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//           }
//           onClick={() => setMode(shapeTypes.OVAL)}
//         >
//           Oval
//         </button>
//         <button
//           style={
//             mode === shapeTypes.ERASER
//               ? {
//                   padding: "8px 12px",
//                   background: "#007bff",
//                   color: "white",
//                   border: "1px solid #007bff",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//               : {
//                   padding: "8px 12px",
//                   background: "#fff",
//                   border: "1px solid #ccc",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                 }
//           }
//           onClick={() => setMode(shapeTypes.ERASER)}
//         >
//           Eraser
//         </button>

//         {mode === shapeTypes.BRUSH && (
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "8px",
//               minWidth: "150px",
//             }}
//           >
//             <label>Size:</label>
//             <input
//               type="range"
//               min="1"
//               max="50"
//               value={brushSize}
//               onChange={(e) => setBrushSize(parseInt(e.target.value))}
//               style={{ width: "100px" }}
//             />
//             <span>{brushSize}</span>
//           </div>
//         )}

//         {mode === shapeTypes.ERASER && (
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "8px",
//               minWidth: "150px",
//             }}
//           >
//             <label>Eraser Size:</label>
//             <input
//               type="range"
//               min="1"
//               max="50"
//               value={brushSize}
//               onChange={(e) => setBrushSize(parseInt(e.target.value))}
//               style={{ width: "100px" }}
//             />
//             <span>{brushSize}</span>
//           </div>
//         )}

//         <button
//           style={{
//             padding: "8px 12px",
//             background: "#fff",
//             border: "1px solid #ccc",
//             borderRadius: "4px",
//             cursor: "pointer",
//             whiteSpace: "nowrap",
//           }}
//           onClick={undo}
//           disabled={undoStack.length === 0}
//         >
//           Undo
//         </button>
//         <button
//           style={{
//             padding: "8px 12px",
//             background: "#fff",
//             border: "1px solid #ccc",
//             borderRadius: "4px",
//             cursor: "pointer",
//             whiteSpace: "nowrap",
//           }}
//           onClick={redo}
//           disabled={redoStack.length === 0}
//         >
//           Redo
//         </button>
//         <button
//           style={{
//             padding: "8px 12px",
//             background: "#28a745",
//             color: "white",
//             borderColor: "#28a745",
//             borderRadius: "4px",
//             cursor: "pointer",
//             whiteSpace: "nowrap",
//           }}
//           onClick={saveNewLayers}
//         >
//           Save
//         </button>
//         <button
//           style={{
//             padding: "8px 12px",
//             background: "#dc3545",
//             color: "white",
//             border: "1px solid #dc3545",
//             borderRadius: "4px",
//             cursor: "pointer",
//             whiteSpace: "nowrap",
//           }}
//           onClick={clearCanvas}
//         >
//           Clear Canvas
//         </button>
//         {!hasImage && (
//           <UploadImage
//             projectId={project.id}
//             onUploadSuccess={handleUploadSuccess}
//           />
//         )}
//         {selectedId && (
//           <button
//             style={{
//               padding: "8px 12px",
//               background: "#6f42c1",
//               color: "white",
//               border: "1px solid #6f42c1",
//               borderRadius: "4px",
//               cursor: "pointer",
//               whiteSpace: "nowrap",
//             }}
//             onClick={changeSelectedColor}
//           >
//             Apply Color
//           </button>
//         )}
//       </div>

//       {mode === shapeTypes.POLYGON && tempPoints.length > 0 && (
//         <div
//           style={{
//             display: "flex",
//             gap: "8px",
//             padding: "8px",
//             background: "#f0f0f0",
//             borderRadius: "4px",
//             marginTop: "8px",
//             position: "absolute",
//             top: "60px",
//             left: "50%",
//             transform: "translateX(-50%)",
//             zIndex: 100,
//           }}
//         >
//           <button
//             style={{
//               padding: "8px 12px",
//               background: "#fff",
//               border: "1px solid #ccc",
//               borderRadius: "4px",
//               cursor: "pointer",
//               whiteSpace: "nowrap",
//             }}
//             onClick={completePolygon}
//             disabled={tempPoints.length < 6}
//           >
//             Complete Polygon
//           </button>
//           <button
//             style={{
//               padding: "8px 12px",
//               background: "#dc3545",
//               color: "white",
//               border: "1px solid #dc3545",
//               borderRadius: "4px",
//               cursor: "pointer",
//               whiteSpace: "nowrap",
//             }}
//             onClick={cancelPolygon}
//           >
//             Cancel
//           </button>
//         </div>
//       )}

//       <div
//         style={{ padding: "8px", background: "#f0f0f0", borderRadius: "4px" }}
//       >
//         <label
//           style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
//         >
//           Color Picker
//         </label>
//         <HexColorPicker
//           color={color}
//           onChange={setColor}
//           style={{
//             width: "100%",
//             height: "150px",
//             borderRadius: "8px",
//             boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.1)",
//           }}
//         />
//       </div>

//       <Stage
//         width={800}
//         height={600}
//         ref={stageRef}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         style={{
//           border: "1px solid #ccc",
//           borderRadius: "8px",
//           background: "#fff",
//         }}
//       >
//         <Layer>
//           {bgImage && <KonvaImage image={bgImage} width={800} height={600} />}
//         </Layer>

//         <Layer>
//           {sortedShapes.map((shape) => renderShape(shape))}

//           {mode === shapeTypes.POLYGON && tempPoints.length > 0 && (
//             <Line
//               points={tempPoints}
//               stroke={color}
//               strokeWidth={2}
//               closed={false}
//             />
//           )}

//           {mode === shapeTypes.BRUSH && isDrawing && (
//             <Path
//               data={brushPath}
//               stroke={color}
//               strokeWidth={brushSize}
//               lineCap="round"
//               lineJoin="round"
//             />
//           )}

//           {mode === shapeTypes.ERASER && isErasing && (
//             <Path
//               data={eraserPath}
//               stroke="#ffffff"
//               strokeWidth={brushSize * 2}
//               lineCap="round"
//               lineJoin="round"
//               opacity={0.5}
//             />
//           )}
//         </Layer>

//         <Layer>
//           <Transformer
//             ref={transformerRef}
//             rotateEnabled={true}
//             enabledAnchors={[
//               "top-left",
//               "top-right",
//               "bottom-left",
//               "bottom-right",
//             ]}
//             borderStroke="#0099ff"
//             borderStrokeWidth={1}
//             anchorStroke="#0099ff"
//             anchorSize={8}
//             anchorCornerRadius={10}
//             keepRatio={false}
//             boundBoxFunc={(oldBox, newBox) => {
//               if (newBox.width < 5 || newBox.height < 5) {
//                 return oldBox;
//               }
//               return newBox;
//             }}
//           />
//         </Layer>
//       </Stage>
//     </div>
//   );
// };

// export default CanvasEditor;

// _________________________________________________________________
// _________________________________________________________________
// _________________________________________________________________
// _________________________________________________________________

import React, { useEffect, useState, useRef } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Circle,
  Line,
  Transformer,
  Path,
  Rect,
  Ellipse,
} from "react-konva";
import useImage from "use-image";
import axios from "../api";
import { HexColorPicker } from "react-colorful";
import UploadImage from "./UploadImage";

const CanvasEditor = ({ project }) => {
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const [imageURL, setImageURL] = useState(null);
  const [imageID, setImageID] = useState(null);
  const [bgImage] = useImage(imageURL || "");
  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState("select");
  const [tempPoints, setTempPoints] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [color, setColor] = useState("#ff0000");
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushPath, setBrushPath] = useState("");
  const [selectedAnchorIndex, setSelectedAnchorIndex] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [eraserPath, setEraserPath] = useState("");
  const [isErasing, setIsErasing] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activePalette, setActivePalette] = useState(0);

  const COLOR_PALETTES = [
    [
      "#FF0000",
      "#FF7F00",
      "#FFFF00",
      "#00FF00",
      "#0000FF",
      "#4B0082",
      "#9400D3",
      "#FFFFFF",
      "#000000",
      "#808080",
      "#C0C0C0",
      "#FF69B4",
    ],
    [
      "#FFD1DC",
      "#FFECB8",
      "#E2F0CB",
      "#B5EAD7",
      "#C7CEEA",
      "#E2D1F9",
      "#FFFFFF",
      "#F8F8F8",
      "#D3D3D3",
      "#A9A9A9",
      "#696969",
      "#FF9AA2",
    ],
    [
      "#3E2723",
      "#5D4037",
      "#795548",
      "#8D6E63",
      "#A1887F",
      "#BCAAA4",
      "#D7CCC8",
      "#EFEBE9",
      "#4E342E",
      "#6D4C41",
      "#8D6E63",
      "#A1887F",
    ],
  ];

  const ColorMatrix = ({ colors, onColorSelect, cellSize = 30 }) => {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "4px",
          margin: "10px 0",
        }}
      >
        {colors.map((color, index) => (
          <div
            key={index}
            onClick={() => onColorSelect(color)}
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: color,
              border: "1px solid #ddd",
              cursor: "pointer",
              borderRadius: "3px",
            }}
            title={color}
          />
        ))}
      </div>
    );
  };

  const shapeTypes = {
    SELECT: "select",
    BRUSH: "brush",
    POLYGON: "polygon",
    CIRCLE: "circle",
    LINE: "line",
    RECTANGLE: "rectangle",
    TRIANGLE: "triangle",
    OVAL: "oval",
    PATH: "path",
    ERASER: "eraser",
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/projects/${project.id}/`);
      const imageData = res.data.image;

      if (imageData && imageData.image_file) {
        setImageURL(imageData.image_file);
        setImageID(imageData.id);
        setHasImage(true);

        const layers = imageData.layers || [];
        const parsedShapes = layers.map((layer, index) => {
          const shape = {
            id: layer.id,
            type: layer.shape_type,
            ...layer.properties,
            isNew: false,
            stroke:
              layer.properties.stroke || layer.properties.fill || "#ff0000",
            strokeWidth: layer.properties.strokeWidth || 2,
            zIndex: index,
          };

          if (layer.shape_type === "triangle" && !layer.properties.points) {
            shape.points = [
              layer.properties.x || 0,
              layer.properties.y || 0,
              (layer.properties.x || 0) - 30,
              (layer.properties.y || 0) + 50,
              (layer.properties.x || 0) + 30,
              (layer.properties.y || 0) + 50,
            ];
            shape.x = 0;
            shape.y = 0;
          }
          return shape;
        });
        setShapes(parsedShapes);
      } else {
        setHasImage(false);
      }
    } catch (error) {
      console.error("Failed to fetch project data", error);
      setHasImage(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (project) {
      fetchData();
    }
  }, [project]);

  const handleUploadSuccess = (imageData) => {
    setImageURL(imageData.image_file);
    setImageID(imageData.id);
    setHasImage(true);
    fetchData();
  };

  const pushToUndo = () => {
    setUndoStack((prev) => [...prev, shapes.map((s) => ({ ...s }))]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prevShapes = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, shapes]);
    setUndoStack((prev) => prev.slice(0, -1));
    setShapes(prevShapes);
    setSelectedId(null);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const nextShapes = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, shapes]);
    setRedoStack((prev) => prev.slice(0, -1));
    setShapes(nextShapes);
    setSelectedId(null);
  };

  const clearCanvas = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear the canvas? This will remove the background image."
    );

    if (confirmed) {
      try {
        const res = await axios.delete(
          `/images/${imageID}/delete-with-layers/`
        );

        setImageURL(null);
        setShapes([]);
        setUndoStack([]);
        setRedoStack([]);
        setSelectedId(null);
        setTempPoints([]);
        setBrushPath("");
        setIsDrawing(false);
        setMode(shapeTypes.SELECT);

        await fetchData();
      } catch (error) {
        console.error("Failed to clear canvas:", error);
        alert("Failed to clear canvas. Please try again.");
      }
    }
  };

  const handleMouseDown = (e) => {
    if (isCreating || !stageRef.current) return;
    setIsCreating(true);

    const stage = stageRef.current.getStage();
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    if (mode === shapeTypes.POLYGON) {
      setTempPoints([...tempPoints, pointer.x, pointer.y]);
    } else if (mode === shapeTypes.BRUSH) {
      setIsDrawing(true);
      setBrushPath(`M${pointer.x},${pointer.y}`);
    } else if (mode === shapeTypes.ERASER) {
      setIsErasing(true);
      setEraserPath(`M${pointer.x},${pointer.y}`);
      eraseAtPosition(pointer);
    } else if (mode === shapeTypes.CIRCLE) {
      pushToUndo();
      const newCircle = {
        id: `temp-${Date.now()}`,
        type: shapeTypes.CIRCLE,
        x: pointer.x,
        y: pointer.y,
        radius: 30,
        fill: color,
        stroke: color,
        strokeWidth: 2,
        isNew: true,
        zIndex: shapes.length,
      };
      setShapes([...shapes, newCircle]);
      setSelectedId(newCircle.id);
    } else if (mode === shapeTypes.LINE) {
      pushToUndo();
      const newLine = {
        id: `temp-${Date.now()}`,
        type: shapeTypes.LINE,
        points: [pointer.x, pointer.y, pointer.x, pointer.y],
        stroke: color,
        strokeWidth: brushSize,
        isNew: true,
        zIndex: shapes.length,
      };
      setShapes([...shapes, newLine]);
      setSelectedId(newLine.id);
    } else if (mode === shapeTypes.RECTANGLE) {
      pushToUndo();
      const newRect = {
        id: `temp-${Date.now()}`,
        type: shapeTypes.RECTANGLE,
        x: pointer.x,
        y: pointer.y,
        width: 50,
        height: 50,
        fill: color,
        stroke: color,
        strokeWidth: 2,
        isNew: true,
        zIndex: shapes.length,
      };
      setShapes([...shapes, newRect]);
      setSelectedId(newRect.id);
    } else if (mode === shapeTypes.TRIANGLE) {
      pushToUndo();
      const newTriangle = {
        id: `temp-${Date.now()}`,
        type: shapeTypes.TRIANGLE,
        points: [
          pointer.x,
          pointer.y,
          pointer.x - 30,
          pointer.y + 50,
          pointer.x + 30,
          pointer.y + 50,
        ],
        fill: color,
        stroke: color,
        strokeWidth: 2,
        isNew: true,
        zIndex: shapes.length,
        x: 0,
        y: 0,
      };
      setShapes([...shapes, newTriangle]);
      setSelectedId(newTriangle.id);
    } else if (mode === shapeTypes.OVAL) {
      pushToUndo();
      const newOval = {
        id: `temp-${Date.now()}`,
        type: shapeTypes.OVAL,
        x: pointer.x,
        y: pointer.y,
        radiusX: 40,
        radiusY: 20,
        fill: color,
        stroke: color,
        strokeWidth: 2,
        isNew: true,
        zIndex: shapes.length,
      };
      setShapes([...shapes, newOval]);
      setSelectedId(newOval.id);
    } else if (mode === shapeTypes.SELECT && selectedId) {
      const tr = transformerRef.current;
      const shape = shapes.find((s) => s.id === selectedId);

      if (tr && shape && tr.getNodes().length > 0) {
        const transformerNode = tr.getNodes()[0];
        if (transformerNode && transformerNode.getChildren) {
          const anchors = transformerNode.getChildren(
            (node) => node.getClassName && node.getClassName() === "Anchor"
          );

          if (anchors) {
            const clickedAnchor = anchors.find((anchor) => {
              const anchorX = anchor.x();
              const anchorY = anchor.y();
              const distance = Math.sqrt(
                Math.pow(pointer.x - (shape.x + anchorX), 2) +
                  Math.pow(pointer.y - (shape.y + anchorY), 2)
              );
              return distance < 10;
            });

            if (clickedAnchor) {
              const anchorIndex = anchors.indexOf(clickedAnchor);
              setSelectedAnchorIndex(anchorIndex);
            }
          }
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!stageRef.current) return;
    const stage = stageRef.current.getStage();
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    if (mode === shapeTypes.BRUSH && isDrawing) {
      setBrushPath((prev) => `${prev} L${pointer.x},${pointer.y}`);
    } else if (mode === shapeTypes.ERASER && isErasing) {
      setEraserPath((prev) => `${prev} L${pointer.x},${pointer.y}`);
      eraseAtPosition(pointer);
    } else if (mode === shapeTypes.LINE && selectedId) {
      const line = shapes.find((s) => s.id === selectedId);
      if (line) {
        const newPoints = [...line.points];
        newPoints[2] = pointer.x;
        newPoints[3] = pointer.y;
        updateShape(selectedId, { points: newPoints });
      }
    } else if (selectedAnchorIndex !== null && selectedId) {
      const shape = shapes.find((s) => s.id === selectedId);
      if (!shape) return;

      if (
        shape.type === shapeTypes.POLYGON ||
        shape.type === shapeTypes.LINE ||
        shape.type === shapeTypes.TRIANGLE
      ) {
        const newPoints = [...shape.points];
        const pointIndex = selectedAnchorIndex * 2;

        if (pointIndex < newPoints.length) {
          newPoints[pointIndex] = pointer.x - (shape.x || 0);
          newPoints[pointIndex + 1] = pointer.y - (shape.y || 0);
          updateShape(selectedId, { points: newPoints });
        }
      }
    }
  };

  const eraseAtPosition = (position) => {
    const eraseRadius = brushSize;

    setShapes((prevShapes) => {
      return prevShapes.filter((shape) => {
        const shapeNode = stageRef.current?.findOne(`#${shape.id}`);
        if (!shapeNode) return true;

        const tempCircle = new window.Konva.Circle({
          x: position.x,
          y: position.y,
          radius: eraseRadius,
        });

        return !shapeNode.intersects(tempCircle.getClientRect());
      });
    });
  };

  const handleMouseUp = (e) => {
    setIsCreating(false);

    if (mode === shapeTypes.BRUSH && isDrawing) {
      if (brushPath) {
        pushToUndo();
        const newShape = {
          id: `temp-${Date.now()}`,
          type: shapeTypes.PATH,
          data: brushPath,
          stroke: color,
          strokeWidth: brushSize,
          isNew: true,
          zIndex: shapes.length,
        };
        setShapes([...shapes, newShape]);
        setBrushPath("");
      }
      setIsDrawing(false);
    } else if (mode === shapeTypes.ERASER && isErasing) {
      setIsErasing(false);
      setEraserPath("");
    } else if (mode === shapeTypes.LINE) {
      setSelectedId(null);
    }
    setSelectedAnchorIndex(null);
  };

  const completePolygon = () => {
    if (tempPoints.length >= 6) {
      finalizePolygon();
    }
  };

  const finalizePolygon = () => {
    if (tempPoints.length < 6) return;

    pushToUndo();

    const newPolygon = {
      id: `temp-${Date.now()}`,
      type: shapeTypes.POLYGON,
      points: [...tempPoints],
      stroke: color,
      strokeWidth: 2,
      fill: color,
      isNew: true,
      zIndex: shapes.length,
    };

    setShapes([...shapes, newPolygon]);
    setTempPoints([]);
    setSelectedId(newPolygon.id);
    setMode(shapeTypes.SELECT);
  };

  const cancelPolygon = () => {
    setTempPoints([]);
  };

  const updateShape = async (id, updates) => {
    setShapes((prevShapes) =>
      prevShapes.map((shape) =>
        shape.id === id ? { ...shape, ...updates } : shape
      )
    );

    if (typeof id === "number") {
      try {
        const shapeToUpdate = shapes.find((s) => s.id === id);
        if (!shapeToUpdate) return;

        let properties = { ...shapeToUpdate, ...updates };
        delete properties.id;
        delete properties.type;
        delete properties.isNew;
        delete properties.zIndex;

        await axios.patch(`/layers/${id}/`, { properties });
      } catch (err) {
        console.error("Failed to update layer:", err);
      }
    }
  };

  const handleDragEnd = (e, id) => {
    const node = e.target;
    const updates = {
      x: node.x(),
      y: node.y(),
    };

    if (node.className === "Line" && node.points()) {
      updates.points = node.points().map((p, i) => {
        return i % 2 === 0 ? p + node.x() : p + node.y();
      });
      updates.x = 0;
      updates.y = 0;
    }

    updateShape(id, updates);
  };

  const handleTransformEnd = (e, id) => {
    const node = e.target;
    let updates = {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
    };

    if (node.className === "Circle") {
      updates.radius = node.radius() * node.scaleX();
    } else if (node.className === "Rect") {
      updates.width = node.width() * node.scaleX();
      updates.height = node.height() * node.scaleY();
    } else if (node.className === "Ellipse") {
      updates.radiusX = node.radiusX() * node.scaleX();
      updates.radiusY = node.radiusY() * node.scaleY();
    } else if (node.className === "Line") {
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

  const changeSelectedColor = () => {
    if (!selectedId) return;
    const shape = shapes.find((s) => s.id === selectedId);
    if (!shape) return;

    const updates = { stroke: color };
    if (shape.type !== shapeTypes.LINE && shape.type !== shapeTypes.PATH) {
      updates.fill = color;
    }

    updateShape(selectedId, updates);
  };

  const saveNewLayers = async () => {
    if (!project?.image?.id) return;

    const imageId = project.image.id;
    const newLayers = shapes.filter((s) => s.isNew);

    for (let i = 0; i < newLayers.length; i++) {
      const shape = newLayers[i];
      let properties = { ...shape };

      if (shape.type === shapeTypes.TRIANGLE) {
        properties.points = shape.points;
        properties.x = shape.x || 0;
        properties.y = shape.y || 0;
      }

      delete properties.id;
      delete properties.type;
      delete properties.isNew;
      delete properties.zIndex;

      const payload = {
        image: imageId,
        layer_id: i + 1,
        shape_type: shape.type,
        properties,
      };

      try {
        const res = await axios.post("/layers/", payload);
        setShapes((prev) =>
          prev.map((s) =>
            s.id === shape.id
              ? { ...res.data, isNew: false, zIndex: shapes.length + i }
              : s
          )
        );
      } catch (err) {
        console.error("Save failed for shape:", shape, err);
      }
    }

    await fetchData();
    alert("New layers saved and refreshed!");
  };

  useEffect(() => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;

    if (!transformer || !stage) return;

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

  const renderShape = (shape) => {
    const commonProps = {
      key: shape.id,
      id: shape.id.toString(),
      draggable: mode === shapeTypes.SELECT,
      rotation: shape.rotation || 0,
      onClick: (e) => {
        if (mode === shapeTypes.SELECT) {
          setSelectedId(shape.id);
        } else if (mode === shapeTypes.ERASER) {
          pushToUndo();
          setShapes((prev) => prev.filter((s) => s.id !== shape.id));
          setSelectedId(null);
          e.cancelBubble = true;
        }
      },
      onTap: (e) => {
        if (mode === shapeTypes.SELECT) {
          setSelectedId(shape.id);
        } else if (mode === shapeTypes.ERASER) {
          pushToUndo();
          setShapes((prev) => prev.filter((s) => s.id !== shape.id));
          setSelectedId(null);
          e.cancelBubble = true;
        }
      },
      onDragEnd: (e) => handleDragEnd(e, shape.id),
      onTransformEnd: (e) => handleTransformEnd(e, shape.id),
      stroke: shape.stroke || shape.fill || color,
      strokeWidth: shape.strokeWidth || 2,
    };

    switch (shape.type) {
      case shapeTypes.CIRCLE:
        return (
          <Circle
            {...commonProps}
            x={shape.x}
            y={shape.y}
            radius={shape.radius}
            fill={shape.fill}
          />
        );
      case shapeTypes.LINE:
        return (
          <Line
            {...commonProps}
            points={shape.points}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
          />
        );
      case shapeTypes.POLYGON:
      case shapeTypes.TRIANGLE:
        return (
          <Line
            {...commonProps}
            points={shape.points}
            fill={shape.fill}
            closed={true}
            x={shape.x || 0}
            y={shape.y || 0}
          />
        );
      case shapeTypes.PATH:
        return (
          <Path
            {...commonProps}
            data={shape.data}
            strokeWidth={shape.strokeWidth}
            lineCap="round"
            lineJoin="round"
          />
        );
      case shapeTypes.RECTANGLE:
        return (
          <Rect
            {...commonProps}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill={shape.fill}
          />
        );
      case shapeTypes.OVAL:
        return (
          <Ellipse
            {...commonProps}
            x={shape.x}
            y={shape.y}
            radiusX={shape.radiusX}
            radiusY={shape.radiusY}
            fill={shape.fill}
          />
        );
      default:
        return null;
    }
  };

  const sortedShapes = [...shapes].sort(
    (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
  );

  if (isLoading) {
    return <div>Loading canvas...</div>;
  }

  return (
    <section className="main-container">
      <section className="canvas-editor">
        <div className="tool-sections">
          <div className="tool-section">
            <h3 style={{ fontSize: "16px" }}>Tools</h3>
            <hr />
            <div className="tool-buttons">
              <button
                className={`tool-btn ${
                  mode === shapeTypes.SELECT ? "active" : ""
                }`}
                onClick={() => setMode(shapeTypes.SELECT)}
              >
                Select
              </button>
              <button
                className={`tool-btn ${
                  mode === shapeTypes.BRUSH ? "active" : ""
                }`}
                onClick={() => setMode(shapeTypes.BRUSH)}
              >
                Brush
              </button>
              <button
                className={`tool-btn ${
                  mode === shapeTypes.ERASER ? "active" : ""
                }`}
                onClick={() => setMode(shapeTypes.ERASER)}
              >
                Eraser
              </button>
            </div>
            {(mode === shapeTypes.BRUSH || mode === shapeTypes.ERASER) && (
              <div className="brush-size-control">
                <label>Brush Size: {brushSize}</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                />
              </div>
            )}
          </div>

          <div className="tool-section">
            <h3 style={{ fontSize: "16px" }}>Shapes</h3>
            <hr />
            <div className="tool-buttons">
              <button
                style={
                  mode === shapeTypes.POLYGON
                    ? {
                        padding: "8px 12px",
                        background: "#007bff",
                        color: "white",
                        border: "1px solid #007bff",
                        borderRadius: "4px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }
                    : {
                        padding: "8px 12px",
                        background: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }
                }
                onClick={() => {
                  setMode(shapeTypes.POLYGON);
                  setTempPoints([]);
                }}
              >
                Polygon
              </button>
              <button
                style={
                  mode === shapeTypes.OVAL
                    ? {
                        padding: "8px 12px",
                        background: "#007bff",
                        color: "white",
                        border: "1px solid #007bff",
                        borderRadius: "4px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }
                    : {
                        padding: "8px 12px",
                        background: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }
                }
                onClick={() => setMode(shapeTypes.OVAL)}
              >
                Oval
              </button>
              <button
                className={`tool-btn ${
                  mode === shapeTypes.RECTANGLE ? "active" : ""
                }`}
                onClick={() => setMode(shapeTypes.RECTANGLE)}
              >
                Rectangle
              </button>
              <button
                className={`tool-btn ${
                  mode === shapeTypes.CIRCLE ? "active" : ""
                }`}
                onClick={() => setMode(shapeTypes.CIRCLE)}
              >
                Circle
              </button>
              <button
                className={`tool-btn ${
                  mode === shapeTypes.TRIANGLE ? "active" : ""
                }`}
                onClick={() => setMode(shapeTypes.TRIANGLE)}
              >
                Triangle
              </button>
              <button
                className={`tool-btn ${
                  mode === shapeTypes.LINE ? "active" : ""
                }`}
                onClick={() => setMode(shapeTypes.LINE)}
              >
                Line
              </button>
            </div>
          </div>

          <div className="tool-section">
            <h3 style={{ fontSize: "16px" }}>Color</h3>
            <hr />
            <div className="tool-option">
              <label>Color Picker:</label>
              <br />
              <input
                style={{ width: "100%", height: "30px", marginBottom: "10px" }}
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                onFocus={(e) => window.innerWidth < 768 && e.target.blur()}
              />
            </div>

            <div className="palette-selector">
              <button
                onClick={() =>
                  setActivePalette(
                    (prev) =>
                      (prev - 1 + COLOR_PALETTES.length) % COLOR_PALETTES.length
                  )
                }
                disabled={COLOR_PALETTES.length <= 1}
              >
                ◀
              </button>
              <span>
                Palette {activePalette + 1}/{COLOR_PALETTES.length}
              </span>
              <button
                onClick={() =>
                  setActivePalette((prev) => (prev + 1) % COLOR_PALETTES.length)
                }
                disabled={COLOR_PALETTES.length <= 1}
              >
                ▶
              </button>
            </div>
            <ColorMatrix
              colors={COLOR_PALETTES[activePalette]}
              onColorSelect={setColor}
            />
          </div>

          <div className="tool-section">
            <h3 style={{ fontSize: "16px" }}>Options</h3>
            <hr />
            <div className="action-buttons-undo-redo">
              <button
                className="action-btn"
                onClick={undo}
                disabled={undoStack.length === 0}
              >
                Undo
              </button>
              <button
                className="action-btn"
                onClick={redo}
                disabled={redoStack.length === 0}
              >
                Redo
              </button>
            </div>
            <div className="left-actions">
              {mode === shapeTypes.POLYGON && tempPoints.length > 0 && (
                <div className="polygon-controls">
                  <button
                    className="action-btn"
                    onClick={completePolygon}
                    disabled={tempPoints.length < 6}
                  >
                    Complete
                  </button>
                  <button className="action-btn danger" onClick={cancelPolygon}>
                    X
                  </button>
                </div>
              )}
            </div>
            <div className="clear-canvas">
              <button className="action-btn" onClick={clearCanvas}>
                Clear Canvas
              </button>
            </div>
            <div className="right-actions">
              {selectedId && (
                <button
                  className="action-btn primary"
                  onClick={changeSelectedColor}
                >
                  Fill Selection
                </button>
              )}
              <button className="action-btn primary" onClick={saveNewLayers}>
                Save
              </button>
              {!hasImage && (
                <UploadImage
                  projectId={project.id}
                  onUploadSuccess={handleUploadSuccess}
                />
              )}
            </div>
          </div>
        </div>

        <div className="canvas-container">
          <Stage
            width={800}
            height={600}
            ref={stageRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="canvas-stage"
          >
            <Layer>
              {bgImage && (
                <KonvaImage image={bgImage} width={800} height={600} />
              )}
            </Layer>

            <Layer>
              {sortedShapes.map((shape) => renderShape(shape))}

              {mode === shapeTypes.POLYGON && tempPoints.length > 0 && (
                <Line
                  points={tempPoints}
                  stroke={color}
                  strokeWidth={2}
                  closed={false}
                />
              )}

              {mode === shapeTypes.BRUSH && isDrawing && (
                <Path
                  data={brushPath}
                  stroke={color}
                  strokeWidth={brushSize}
                  lineCap="round"
                  lineJoin="round"
                />
              )}

              {mode === shapeTypes.ERASER && isErasing && (
                <Path
                  data={eraserPath}
                  stroke="#ffffff"
                  strokeWidth={brushSize * 2}
                  lineCap="round"
                  lineJoin="round"
                  opacity={0.5}
                />
              )}
            </Layer>

            <Layer>
              <Transformer
                ref={transformerRef}
                rotateEnabled={true}
                enabledAnchors={[
                  "top-left",
                  "top-right",
                  "bottom-left",
                  "bottom-right",
                ]}
                borderStroke="#0099ff"
                borderStrokeWidth={1}
                anchorStroke="#0099ff"
                anchorSize={8}
                anchorCornerRadius={10}
                keepRatio={false}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            </Layer>
          </Stage>

          <style jsx>{`
            #root {
              background-color: rgb(191, 226, 255);
            }

            .canvas-editor {
              height: 80vh;
              display: flex;
              flex-direction: row;
              justify-content: center;
              align-items: flex-start;
              gap: 50px;
              padding: 20px;
              max-width: 1000px;
              margin: 0 auto;
              padding: 20px;
            }

            .canvas-container {
              display: flex;
              flex-direction: column;
              gap: 16px;
              background-color: #f5f5f5;
              // min-height: 98vh;
              // min-width: 800px;
              // max-width: 100%;
            }

            .canvas-title {
              font-size: 32px;
              font-weight: bold;
              font-family: "Arial", sans-serif;
              text-align: center;
              padding-bottom: 20px;
              padding-top: 50px;
              border-bottom: 2px solid #ccc;
              margin: 0;
            }

            .tool-sections {
              display: flex;
              flex-direction: column;
              flex-wrap: wrap;
              gap: 20px;
              padding: 15px;
              margin-bottom: 30px;
              background: rgb(219, 123, 123);
              border-radius: 8px;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }

            .tool-sections > div {
              flex: 1;
            }

            .tool-option,
            .action-buttons-undo-redo {
              padding-top: 20px;
            }

            .clear-canvas,
            .right-actions,
            .color-picker-container {
              display: flex;
              justify-content: center;
              margin-top: 10px;
            }

            .tool-section {
              flex: 1;
              min-width: 150px;
              padding: 10px;
              // background: #f0f0f0;
              border-radius: 6px;
            }

            .tool-section h3 {
              margin-top: 0;
              margin-bottom: 10px;
              font-size: 14px;
              color: #333;
            }

            .tool-buttons {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              padding-top: 20px;
            }

            .tool-btn {
              padding: 8px 12px;
              background: #fff;
              border: 1px solid #ccc;
              border-radius: 4px;
              cursor: pointer;
              white-space: nowrap;
              transition: all 0.2s;
              font-size: 12px;
            }

            .tool-btn:hover {
              background: #e9e9e9;
            }

            .tool-btn.active {
              background: #007bff;
              color: white;
              border-color: #007bff;
            }

            .color-picker-container {
              margin-bottom: 10px;
            }

            .color-picker {
              width: 100%;
              height: 100px;
              border-radius: 6px;
              margin-bottom: 10px;
            }

            .palette-selector {
              display: flex;
              align-items: center;
              justify-content: space-around;
              font-size: 12px;
            }

            .palette-option {
              display: flex;
              align-items: center;
              font-size: 12px;
            }

            .palette-option input {
              margin-right: 5px;
            }

            .brush-size-control {
              font-size: 12px;
            }

            .brush-size-control label {
              display: block;
              margin-bottom: 5px;
            }

            .brush-size-control input {
              width: 100%;
            }

            .action-buttons {
              display: flex;
              justify-content: space-between;
              gap: 10px;
              padding: 15px;
              background: #fff;
              border-radius: 8px;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }

            .left-actions,
            .right-actions {
              display: flex;
              gap: 8px;
            }

            .action-buttons-undo-redo {
              display: flex;
              gap: 10px;
              justify-content: center;
            }

            .action-btn {
              padding: 8px 12px;
              background: #fff;
              border: 1px solid #ccc;
              border-radius: 4px;
              cursor: pointer;
              white-space: nowrap;
              transition: all 0.2s;
              font-size: 12px;
            }

            .action-btn:hover {
              background: #e9e9e9;
            }

            .action-btn:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }

            .action-btn.primary {
              background: #007bff;
              color: white;
              border-color: #007bff;
            }

            .action-btn.primary:hover {
              background: #0069d9;
            }

            .action-btn.danger {
              background: #dc3545;
              color: white;
              border-color: #dc3545;
            }

            .action-btn.danger:hover {
              background: #c82333;
            }

            .polygon-controls {
              display: flex;
              gap: 8px;
              padding: 8px;
              background: #f0f0f0;
              border-radius: 4px;
              margin-top: 8px;
            }

            .canvas-stage {
              border: 1px solid #ccc;
              border-radius: 8px;
              background: #fff;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              // min-height: 98vh;
              // min-width: 800px;
              // max-width: 100%;
            }
          `}</style>
        </div>
      </section>
    </section>
  );
};

export default CanvasEditor;

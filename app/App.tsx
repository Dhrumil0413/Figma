"use client";

import { fabric } from 'fabric';

import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { useEffect, useRef, useState } from "react";
import { handleCanvaseMouseMove, handleCanvasMouseDown, handleCanvasMouseUp, handleCanvasObjectModified, handleCanvasSelectionCreated, handlePathCreated, handleResize, initializeFabric, renderCanvas } from '@/lib/canvas';
import { ActiveElement, Attributes } from '@/types/type';
import { useMutation, useRedo, useStorage, useUndo } from '@/liveblocks.config';
import { defaultNavElement } from '@/constants';
import { handleDelete, handleKeyDown } from '@/lib/key-events';
import { handleImageUpload } from '@/lib/shapes';

export default function Page() {
  const undo = useUndo();
  const redo = useRedo();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isEditingRef = useRef(false);

  const activeObjectRef = useRef<fabric.Object | null> (null);

  const canvasObjects = useStorage((root) => root.canvasObjects);

  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width: '',
    height: '',
    fontSize: '',
    fontFamily: '',
    fontWeight: '',
    fill: '#aabbcc',
    opacity: '1',
    stroke: '#aabbcc',
  });


  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;

    const { objectId } = object;

    const shapeData = object.toJSON();
    shapeData.objectId = objectId;

    const canvasObjects = storage.get('canvasObjects');

    canvasObjects.set(objectId, shapeData);
  }, []);

  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: '',
    value: '',
    icon: '',
  });

  const deleteAllShapes = useMutation(({ storage }) => {
    const canvasObjects = storage.get('canvasObjects');

    if (!canvasObjects || canvasObjects.size === 0) return true;
    
    const keys = Array.from(canvasObjects.keys()); // Get an array of keys
    for (const key of keys) {
        canvasObjects.delete(key); // Delete the key
    }

    return canvasObjects.size === 0;
  }, []);

  const deleteShapeFromStorage = useMutation(({ storage }, objectId) => {
    const canvasObjects = storage.get('canvasObjects');

    canvasObjects.delete(objectId);
  }, [])

  const handleActiveElement = (element: ActiveElement) => {
    setActiveElement(element);

    switch (element?.value) {
      case 'reset':
        deleteAllShapes();
        fabricRef.current?.clear();
        setActiveElement(defaultNavElement);
        break;
      
      case 'delete':
        // @ts-expect-error  The delete fabric.current is being passed as same type;
        handleDelete(fabricRef.current, deleteShapeFromStorage);
        setActiveElement(defaultNavElement);
        break;

      case 'image':
        imageInputRef.current?.click();
        isDrawing.current = false;

        if (fabricRef.current) {
          fabricRef.current.isDrawingMode = false;
        }
        break;
    
      default:
        break;
    }

    selectedShapeRef.current = element?.value as string;

  }

  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });

    canvas.on("mouse:down", (options: fabric.IEvent) => {
      handleCanvasMouseDown({
        options,
        canvas,
        selectedShapeRef,
        isDrawing,
        shapeRef,
      })
    }); 

    canvas.on("mouse:move", (options: fabric.IEvent) => {
      handleCanvaseMouseMove({
        options,
        canvas,
        selectedShapeRef,
        isDrawing,
        shapeRef,
        syncShapeInStorage
      })
    }); 

    canvas.on("mouse:up", () => {
      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        activeObjectRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
      });
    });

    canvas.on("object:modified", (options: fabric.IEvent) => {
      handleCanvasObjectModified({
        options,
        syncShapeInStorage
      })
    });
    
    canvas.on("selection:created", (options: fabric.IEvent) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef: {...isEditingRef, current: true}, 
        setElementAttributes,
      });
    });
    
    // The scaling mission failed. The thing is this inbuilt function doesn't work gotta work on it after i've completed the other features.
    canvas.on("object:scaling", (options: fabric.IEvent) => {
      console.log("Scaled Element:", options);
      // handleCanvasObjectScaling({
      //   options, setElementAttributes,
      // });
    });

    canvas.on("path:created", (options: fabric.IEvent) => {
      handlePathCreated({
        options, syncShapeInStorage    
      })
    })

    window.addEventListener("resize", () => {
        // @ts-expect-error this fabricRef is actually same type as defined but still giving error.
      handleResize({ fabricRef });
    })

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      handleKeyDown({
        e, 
        canvas: fabricRef.current, 
        undo, 
        redo,
        syncShapeInStorage,
        deleteShapeFromStorage,
      });
    })

    return () => {
      canvas.dispose();
    }
  }, [deleteShapeFromStorage, redo, syncShapeInStorage, undo]);

  useEffect(() => {
    renderCanvas({ fabricRef, canvasObjects, activeObjectRef});
  })

  return (
    <main className="h-screen overflow-hidden">
      <Navbar activeElement={activeElement} handleActiveElement={handleActiveElement} imageInputRef={imageInputRef} 
      handleImageUpload={(e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const file = e.target.files?.[0]; // Use optional chaining to safely access the first file  
        if (file) { // Check if a file is selected
            handleImageUpload({
            file,
            // @ts-expect-error the canvas is also being passed as same useRef type;
            canvas: fabricRef,
            shapeRef,
            syncShapeInStorage,
            });
        }
      }}/>
      <section className="flex h-full flex-row overflow-hidden">
        <LeftSidebar allShapes={Array.from(canvasObjects)} />
        <Live canvasRef={canvasRef} undo={undo} redo={redo} />
        <RightSidebar elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          fabricRef={fabricRef}
          isEditingRef={isEditingRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
  />
      </section>
    </main>
  );
}
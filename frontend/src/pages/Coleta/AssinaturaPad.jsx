// C:\dev\sgc\frontend\src\pages\Coleta\AssinaturaPad.jsx

import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

/**
 * Componente de assinatura simples em canvas.
 *
 * Props:
 * - width, height: tamanho em px do canvas (padrão: 280 x 100)
 * - className: classe extra para estilização externa
 */
const AssinaturaPad = forwardRef(
  ({ width = 280, height = 100, className = "" }, ref) => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [desenhando, setDesenhando] = useState(false);
    const [temTraço, setTemTraço] = useState(false);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      ctxRef.current = ctx;

      // Fundo branco
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
    }, []);

    const getPosCanvas = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      let clientX;
      let clientY;

      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handleStart = (e) => {
      e.preventDefault();
      const ctx = ctxRef.current;
      if (!ctx) return;

      const { x, y } = getPosCanvas(e);

      ctx.beginPath();
      ctx.moveTo(x, y);
      setDesenhando(true);
      setTemTraço(true);
    };

    const handleMove = (e) => {
      if (!desenhando) return;
      e.preventDefault();

      const ctx = ctxRef.current;
      if (!ctx) return;

      const { x, y } = getPosCanvas(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const handleEnd = (e) => {
      e && e.preventDefault();
      if (!desenhando) return;
      const ctx = ctxRef.current;
      if (!ctx) return;

      ctx.closePath();
      setDesenhando(false);
    };

    const limpar = () => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Repreenche fundo branco
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      setTemTraço(false);
    };

    const getImage = () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      // Se nunca desenhou nada, opcionalmente retornar null
      if (!temTraço) return null;

      return canvas.toDataURL("image/png");
    };

    useImperativeHandle(ref, () => ({
      clear: limpar,
      getImage,
    }));

    return (
      <div className={`assinatura-wrapper ${className}`}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="assinatura-canvas"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>
    );
  }
);

export default AssinaturaPad;

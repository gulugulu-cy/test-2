import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Markmap } from 'markmap-view';
import { transformer } from './markmap';
import 'markmap-toolbar/dist/style.css';

export default function MarkmapComponent(props: { markdown: string, styles?: React.CSSProperties, type?: string, closeDownload: () => void }) {
  const { markdown, type, styles, closeDownload } = props;
  const refSvg = useRef<SVGSVGElement>();
  const refMm = useRef<Markmap>();

  useEffect(() => {
    if (refMm.current) return;
    const mm = Markmap.create(refSvg.current);
    refMm.current = mm;
  }, [refSvg.current]);

  useEffect(() => {
    if (!refMm.current) return;
    const mm = refMm.current;
    const { root } = transformer.transform(markdown);
    mm.setData(root);
    mm.fit();
  }, [refMm.current, markdown]);

  const handleDownload = useCallback(async (format: 'png' | 'jpeg' | 'svg') => {
    const svg = refSvg.current;
    const mm = refMm.current;
    if (!mm) return;
    await mm.fit();

    if (format === 'svg') {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = 'markmap.svg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    } else {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const bbox = svg.getBBox();
        const scale = 2;
        canvas.width = 3840 * scale;
        canvas.height = 2160 * scale;

        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (format === 'jpeg') {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          const scaleX = canvas.width / bbox.width;
          const scaleY = canvas.height / bbox.height;
          const scaleFactor = Math.min(scaleX, scaleY);

          const translateX =
            (canvas.width - bbox.width * scaleFactor) / 2 -
            bbox.x * scaleFactor;
          const translateY =
            (canvas.height - bbox.height * scaleFactor) / 2 -
            bbox.y * scaleFactor;

          ctx.setTransform(
            scaleFactor,
            0,
            0,
            scaleFactor,
            translateX,
            translateY
          );

          ctx.drawImage(img, 0, 0);

          const dataUrl = canvas.toDataURL(`image/${format}`, 0.9);
          const downloadLink = document.createElement('a');
          downloadLink.download = `markmap-4k.${format}`;
          downloadLink.href = dataUrl;
          downloadLink.click();
        }
      };

      img.src =
        'data:image/svg+xml;base64,' +
        btoa(unescape(encodeURIComponent(svgData)));
    }
    closeDownload()
  }, []);

  const handleDownloadPNG = useCallback(
    () => handleDownload('png'),
    [handleDownload]
  );
  const handleDownloadJPEG = useCallback(
    () => handleDownload('jpeg'),
    [handleDownload]
  );
  const handleDownloadSVG = useCallback(
    () => handleDownload('svg'),
    [handleDownload]
  );

  useEffect(() => {
    if (type) {
      switch (type) {
        case 'png':
          handleDownloadPNG()
          break;
        case 'jpeg':
          handleDownloadJPEG()
          break;
        case 'svg':
          handleDownloadSVG()
          break;
      }
    }
  }, [type])

  return (
    <svg className={`flex-1 w-full h-full text-foreground`} ref={refSvg} style={{ ...styles, color: 'hsl(var(--foreground)) !important' }} />
  );
}

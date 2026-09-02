import type { State } from '$/types';
import Hammer from 'hammerjs';
import type { Point } from 'mermaid/dist/types.js';
import panzoom from 'svg-pan-zoom';
type PanZoom = typeof panzoom;

interface ViewportSize {
  height: number;
  realZoom: number;
  width: number;
}

export interface NormalizedViewport {
  center: Point;
  /** Zoom relative to the diagram's fit-to-container zoom. */
  zoom: number;
}

export const normalizeViewport = (
  pan: Point,
  zoom: number,
  { height, realZoom, width }: ViewportSize
): NormalizedViewport => ({
  center: {
    x: (width / 2 - pan.x) / realZoom,
    y: (height / 2 - pan.y) / realZoom
  },
  zoom
});

export const denormalizeViewportPan = (
  viewport: NormalizedViewport,
  { height, realZoom, width }: ViewportSize
): Point => ({
  x: width / 2 - viewport.center.x * realZoom,
  y: height / 2 - viewport.center.y * realZoom
});

export class PanZoomState {
  private pan?: Point;
  private zoom?: number;
  private pzoom: PanZoom | undefined;
  private isDirty = false;
  private resizeObserver: ResizeObserver;
  private syncedViewport?: NormalizedViewport;

  public isPanEnabled: boolean;
  public onPanZoomChange?: (pan: Point, zoom: number) => void;

  constructor() {
    this.isPanEnabled = true;
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
  }

  public updateElement(diagramView: SVGElement, { pan, zoom }: Pick<State, 'pan' | 'zoom'>) {
    this.pzoom?.destroy();
    this.syncedViewport = undefined;
    let hammer: HammerManager | undefined;
    this.pzoom = panzoom(diagramView, {
      center: true,
      controlIconsEnabled: false,
      customEventsHandler: {
        haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],
        init: function (options) {
          const instance = options.instance;
          let initialScale = 1;
          let pannedX = 0;
          let pannedY = 0;
          hammer = new Hammer(options.svgElement);

          const resetPanned = () => {
            pannedX = 0;
            pannedY = 0;
          };
          const handlePan = (event: HammerInput) => {
            instance.panBy({ x: event.deltaX - pannedX, y: event.deltaY - pannedY });
            pannedX = event.deltaX;
            pannedY = event.deltaY;
          };

          hammer.get('pinch').set({ enable: true });
          hammer.on('panstart panmove', function (event) {
            if (event.type === 'panstart') {
              resetPanned();
            }
            handlePan(event);
          });
          hammer.on('pinchstart pinchmove', function (event) {
            if (event.type === 'pinchstart') {
              initialScale = instance.getZoom();
              resetPanned();
            }
            instance.zoomAtPoint(initialScale * event.scale, {
              x: event.center.x,
              y: event.center.y
            });
            handlePan(event);
          });
          options.svgElement.addEventListener('touchmove', function (event) {
            event.preventDefault();
          });
        },
        destroy: function () {
          hammer?.destroy();
        }
      },
      fit: true,
      maxZoom: 12,
      minZoom: 0.2,
      onPan: (pan) => {
        this.pan = pan;
        this.zoom = this.pzoom?.getZoom();
        this.isDirty = true;
        if (this.zoom) {
          this.onPanZoomChange?.(this.pan, this.zoom);
        }
      },
      onZoom: (zoom) => {
        this.zoom = zoom;
        this.pan = this.pzoom?.getPan();
        this.isDirty = true;
        if (this.pan) {
          this.onPanZoomChange?.(this.pan, this.zoom);
        }
      },
      panEnabled: true,
      zoomEnabled: true
    });

    this.pzoom.disableDblClickZoom();

    this.resizeObserver.disconnect();
    this.resizeObserver.observe(diagramView);

    if (pan && zoom && Number.isFinite(zoom) && Number.isFinite(pan.x) && Number.isFinite(pan.y)) {
      this.restorePanZoom(pan, zoom);
    } else {
      this.reset();
    }

    // we start out with both pan and zoom enabled so that the tool can auto position view refreshed
    // then set enable/disable pan based on state
    if (this.isPanEnabled) {
      this.pzoom.enablePan();
      this.pzoom.enableZoom();
    } else {
      this.pzoom.disableZoom();
      this.pzoom.disablePan();
    }

    if (pan === undefined && zoom === undefined) {
      this.reset();
    }
  }

  public restorePanZoom(pan: Point, zoom: number) {
    if (!this.pzoom) {
      console.error('PanZoomState.restorePanZoom: pzoom is not initialized');
      return;
    }
    this.syncedViewport = undefined;
    this.pzoom.zoom(zoom);
    this.pzoom.pan(pan);
  }

  public getNormalizedViewport(): NormalizedViewport | undefined {
    if (!this.pzoom) {
      return;
    }
    const pan = this.pzoom.getPan();
    const zoom = this.pzoom.getZoom();
    const sizes = this.pzoom.getSizes();
    if (
      !Number.isFinite(pan.x) ||
      !Number.isFinite(pan.y) ||
      !Number.isFinite(zoom) ||
      !Number.isFinite(sizes.width) ||
      !Number.isFinite(sizes.height) ||
      !Number.isFinite(sizes.realZoom) ||
      sizes.realZoom === 0
    ) {
      return;
    }
    return normalizeViewport(pan, zoom, sizes);
  }

  public restoreNormalizedViewport(viewport: NormalizedViewport) {
    if (!this.pzoom) {
      return;
    }
    this.syncedViewport = {
      center: { ...viewport.center },
      zoom: viewport.zoom
    };
    this.pzoom.zoom(viewport.zoom);
    this.pzoom.pan(denormalizeViewportPan(viewport, this.pzoom.getSizes()));
    this.isDirty = true;
  }

  public resize() {
    this.pzoom?.resize();
    if (this.syncedViewport) {
      this.restoreNormalizedViewport(this.syncedViewport);
    } else if (!this.isDirty) {
      this.reset();
    }
  }

  public zoomIn() {
    this.syncedViewport = undefined;
    this.pzoom?.zoomIn();
  }

  public zoomOut() {
    this.syncedViewport = undefined;
    this.pzoom?.zoomOut();
  }

  public reset() {
    this.syncedViewport = undefined;
    this.pzoom?.reset();
    // Zoom out a bit to avoid overlap with the toolbar
    this.pzoom?.zoom(0.875);
    this.isDirty = false;
  }
}

import {useState, useRef, useMemo} from "react";
import DeckGL from "@deck.gl/react";
import {useNextFrame, BasicControls, useDeckAdapter} from "@hubble.gl/react";
import {LineLayer} from "@deck.gl/layers";
import {DeckAnimation} from "@hubble.gl/core";
import {easeIn} from "popmotion";

const initialViewState = {
  latitude: 37.7853,
  longitude: -122.41669,
  zoom: 11.5,
  bearing: 140,
  pitch: 60,
};
const timecode = {
  start: 0, // ms
  end: 5000, // ms
  framerate: 30,
};

const resolution = {
  width: 400, // px
  height: 400, // px
};

const formatConfigs = {
  webm: {
    quality: 0.8,
  },
  png: {
    archive: "zip",
  },
  jpeg: {
    archive: "zip",
    quality: 0.8,
  },
  gif: {
    sampleInterval: 1000,
    width: resolution.width,
    height: resolution.height,
  },
};

const deckAnimation = new DeckAnimation({
  // Use applyLayerKeyframes to spread keyframe values onto layers by id.
  getLayers: (a) =>
    a.applyLayerKeyframes([
      new LineLayer({
        id: "line-layer",
        getColor: [243, 140, 0],
        getWidth: 50,
        opacity: 1,
        getSourcePosition: (d) => d.sourcePosition,
        getTargetPosition: (d) => d.targetPosition,
        data: [
          {
            sourcePosition: [-122.41669, 37.7853],
            targetPosition: [-122.41669, 37.781],
          },
        ],
      }),
    ]),
  layerKeyframes: [
    {
      id: "line-layer",
      timings: [0, 1000],
      keyframes: [{opacity: 0.5}, {opacity: 1}],
    },
  ],
  cameraKeyframe: {
    timings: [0, 5000], // ms
    keyframes: [
      {
        latitude: 37.7853,
        longitude: -122.41669,
        zoom: 11.5,
        bearing: 140,
        pitch: 60,
      },
      {
        latitude: 37.7853,
        longitude: -122.41669,
        zoom: 11.5,
        bearing: 0,
        pitch: 30,
      },
    ],
    easing: easeIn,
  },
});

export default function App() {
  const deckRef = useRef(null);
  const deck = useMemo(
    () => deckRef.current && deckRef.current.deck,
    [deckRef]
  );
  const [busy, setBusy] = useState(false);
  const nextFrame = useNextFrame();

  const {adapter, layers, cameraFrame, setCameraFrame} = useDeckAdapter(
    deckAnimation,
    initialViewState
  );

  const props = adapter.getProps({deck, nextFrame});

  return (
    <div style={{position: "relative", ...resolution}}>
      <DeckGL
        ref={deckRef}
        layers={layers}
        viewState={cameraFrame}
        onViewStateChange={({viewState}) => setCameraFrame(viewState)}
        width={resolution.width}
        height={resolution.height}
        {...props}
      />
      <div className="controls">
        <BasicControls
          adapter={adapter}
          busy={busy}
          setBusy={setBusy}
          formatConfigs={formatConfigs}
          timecode={timecode}
        />
      </div>
    </div>
  );
}

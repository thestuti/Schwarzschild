// MeteorLauncher.jsx
import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;

export default function MeteorLauncher() {
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    const viewer = new Cesium.Viewer(viewerRef.current, {
      terrainProvider: new Cesium.EllipsoidTerrainProvider(),
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      infoBox: false,
      fullscreenButton: false,
      selectionIndicator: false,
      creditContainer: document.createElement("div"),
    });

    Cesium.createWorldTerrainAsync().then((terrainProvider) => {
      viewer.terrainProvider = terrainProvider;
    });

    // Create crater on impact
    function createCrater(lon, lat, radius = 50000) {
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
        ellipse: {
          semiMajorAxis: radius,
          semiMinorAxis: radius,
          material: Cesium.Color.DARKGRAY.withAlpha(0.7),
          height: 0,
        },
      });
    }

    // Launch meteor with realistic trail & effects
    function launchMeteor(lon, lat) {
      const startHeight = 100000; // 100 km
      let height = startHeight;
      let speed = 600; // meters per frame (will increase with atmospheric entry)
      const trailPoints = []; // Store trail history for realistic fading
      const maxTrailPoints = 30;

      // Create the meteor with enhanced visuals
      const meteor = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat, height),
        point: { 
          pixelSize: 25, 
          color: new Cesium.CallbackProperty(() => {
            // Flicker effect for the meteor
            const intensity = 0.8 + Math.random() * 0.2;
            return Cesium.Color.ORANGE.withAlpha(intensity);
          }, false),
          outlineColor: Cesium.Color.YELLOW,
          outlineWidth: 3,
          scaleByDistance: new Cesium.NearFarScalar(1000, 2.0, 100000, 0.5)
        }
      });

      // Main bright trail
      const mainTrail = viewer.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(() => {
            if (trailPoints.length < 2) return [];
            return trailPoints.slice();
          }, false),
          width: new Cesium.CallbackProperty(() => {
            // Atmospheric entry effect - trail gets thicker as it descends
            const atmosphereHeight = 80000;
            if (height < atmosphereHeight) {
              const factor = 1 - (height / atmosphereHeight);
              return 15 + (factor * 25);
            }
            return 15;
          }, false),
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: new Cesium.CallbackProperty(() => {
              const atmosphereHeight = 80000;
              const heatFactor = Math.max(0, 1 - (height / atmosphereHeight));
              return 0.2 + heatFactor * 0.3;
            }, false),
            color: new Cesium.CallbackProperty(() => {
              const atmosphereHeight = 80000;
              if (height > atmosphereHeight) {
                return Cesium.Color.LIGHTBLUE.withAlpha(0.9);
              } else {
                const heatFactor = 1 - (height / atmosphereHeight);
                const red = Math.min(1, 0.3 + heatFactor * 0.7);
                const green = Math.min(1, heatFactor * 0.6);
                const blue = Math.max(0, 1 - heatFactor * 1.2);
                return new Cesium.Color(red, green, blue, 0.9);
              }
            }, false)
          }),
          clampToGround: false
        }
      });

      // Secondary wider glow trail for atmospheric effect
      const glowTrail = viewer.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(() => {
            if (trailPoints.length < 2) return [];
            return trailPoints.slice();
          }, false),
          width: new Cesium.CallbackProperty(() => {
            const atmosphereHeight = 80000;
            if (height < atmosphereHeight) {
              const factor = 1 - (height / atmosphereHeight);
              return 40 + (factor * 60);
            }
            return 40;
          }, false),
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: new Cesium.CallbackProperty(() => {
              const atmosphereHeight = 80000;
              const heatFactor = Math.max(0, 1 - (height / atmosphereHeight));
              return 0.1 + heatFactor * 0.2;
            }, false),
            color: new Cesium.CallbackProperty(() => {
              const atmosphereHeight = 80000;
              if (height > atmosphereHeight) {
                return Cesium.Color.WHITE.withAlpha(0.3);
              } else {
                const heatFactor = 1 - (height / atmosphereHeight);
                return Cesium.Color.ORANGE.withAlpha(0.4 + heatFactor * 0.2);
              }
            }, false)
          }),
          clampToGround: false
        }
      });

      // Particle debris trail
      const debrisTrail = viewer.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(() => {
            if (trailPoints.length < 2) return [];
            // Create slightly offset positions for debris effect
            return trailPoints.map((pos, index) => {
              if (index % 3 === 0) {
                const offset = 200 * Math.sin(index * 0.5);
                const cartographic = Cesium.Cartographic.fromCartesian(pos);
                return Cesium.Cartesian3.fromRadians(
                  cartographic.longitude + offset * 0.00001,
                  cartographic.latitude + offset * 0.00001,
                  cartographic.height
                );
              }
              return pos;
            });
          }, false),
          width: 5,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.1,
            color: Cesium.Color.YELLOW.withAlpha(0.5)
          }),
          clampToGround: false
        }
      });

      // Animate meteor fall with enhanced trail
      function animate() {
        height -= speed;

        // Add current position to trail history
        const currentPos = Cesium.Cartesian3.fromDegrees(lon, lat, height);
        trailPoints.unshift(currentPos);
        
        // Limit trail length for performance and realistic fading
        if (trailPoints.length > maxTrailPoints) {
          trailPoints.pop();
        }

        if (height <= 0) {
          viewer.entities.remove(meteor);
          viewer.entities.remove(mainTrail);
          viewer.entities.remove(glowTrail);
          viewer.entities.remove(debrisTrail);
          createCrater(lon, lat);
          
          // Add impact flash effect
          const flash = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
            point: {
              pixelSize: 200,
              color: Cesium.Color.WHITE.withAlpha(0.8),
              scaleByDistance: new Cesium.NearFarScalar(1000, 3.0, 50000, 0.5)
            }
          });
          
          // Remove flash after short duration
          setTimeout(() => {
            viewer.entities.remove(flash);
          }, 300);
          
        } else {
          meteor.position = currentPos;
          
          // Increase speed as it enters atmosphere (realistic physics)
          if (height < 80000) {
            speed += 2;
          }
          
          requestAnimationFrame(animate);
        }
      }

      animate();
    }

    // Handle globe clicks
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (click) {
      const cartesian = viewer.camera.pickEllipsoid(
        click.position,
        viewer.scene.globe.ellipsoid
      );
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        launchMeteor(longitude, latitude);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
      viewer.destroy();
    };
  }, []);

  return <div ref={viewerRef} style={{ width: "100%", height: "100vh" }} />;
}
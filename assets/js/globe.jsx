const { useState, useEffect } = React;

        const polygonsMaterial = new THREE.MeshLambertMaterial({ color: 'darkslategrey', side: THREE.DoubleSide });

        const World = () => {
          const [landPolygons, setLandPolygons] = useState([]);

          useEffect(() => {
            // load data
            fetch('https://narayana-rao.github.io/assets/js/land-110m.json').then(res => res.json())
              .then(landTopo => {
                setLandPolygons(topojson.feature(landTopo, landTopo.objects.land).features);
              });
          }, []);

          return <Globe
            backgroundColor="rgba(255,255,255,0)"
            showGlobe={false}
            showAtmosphere={false}
            polygonsData={landPolygons}
            polygonCapMaterial={polygonsMaterial}
            polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
          />;
        };

        ReactDOM.render(
          <World />,
          document.getElementById('globeViz')
        );
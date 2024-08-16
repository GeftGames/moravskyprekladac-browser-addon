var map_Zoom = .34;
var map_LocX = 17,
    map_LocY = 0;
var map_LocX2 = 0,
    map_LocY2 = 0;
var map_LocTmpX = 0,
    map_LocTmpY = 0;
var map_LocTmp2X = 0,
    map_LocTmp2Y = 0;
var map_DisplayWidth, map_DisplayHeight;
var map_Touches = -1;
var mapSelectLang;

document.addEventListener('DOMContentLoaded', function() {
    LoadMap();
});

function LoadMap(){
	// img
    imgMap = new Image();
    imgMap.src = "../data/images/map.svg";
	
	window.addEventListener("resize", (event) => {
        window.requestAnimationFrame(mapRedraw);
    });

    mapSelectLang= document.getElementById("mapSelectLang");

    mapSelectLang.addEventListener("wheel", function(e) {
        e.preventDefault();
        let prevZoom = map_Zoom;
        let delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);

        if (delta > 0) map_Zoom *= 1.2;
        else map_Zoom /= 1.2;
        if (map_Zoom <= 0.2) map_Zoom = 0.2;
        if (map_Zoom > 12) map_Zoom = 12;

        const rect = mapSelectLang.getBoundingClientRect(); // Get canvas position relative to viewport
        const mouseX = e.clientX - rect.left; // Calculate mouse position relative to canvas
        const mouseY = e.clientY - rect.top;

        const imgMX = mouseX - map_LocX,
            imgMY = mouseY - map_LocY;

        const imgPMX = imgMX / (imgMap.width * prevZoom),
            imgPMY = imgMY / (imgMap.height * prevZoom);

        map_LocX -= (map_Zoom - prevZoom) * imgMap.width * imgPMX;
        map_LocY -= (map_Zoom - prevZoom) * imgMap.height * imgPMY;

        window.requestAnimationFrame(mapRedraw);
    });

    // Počet prstů na obrazovce
    mapSelectLang.addEventListener('mousedown', (e) => {
        e.preventDefault();
        moved = true;
        map_LocTmpX = e.clientX - map_LocX;
        map_LocTmpY = e.clientY - map_LocY;

        window.requestAnimationFrame(mapRedraw);
    });

    mapSelectLang.addEventListener('mouseup', (e) => {
        moved = false;
        window.requestAnimationFrame(mapRedraw);
    });

    mapSelectLang.addEventListener('click', (e) => {
        const rect = mapSelectLang.getBoundingClientRect(); // Get canvas position relative to viewport
        const mouseX = e.clientX - rect.left; // Calculate mouse position relative to canvas
        const mouseY = e.clientY - rect.top;
        mapClick(mouseX, mouseY);
        window.requestAnimationFrame(mapRedraw);
    });

    mapSelectLang.addEventListener('mousemove', (e) => {
        e.preventDefault();
        if (moved) {
            map_LocX = e.clientX - map_LocTmpX;
            map_LocY = e.clientY - map_LocTmpY;
			
            window.requestAnimationFrame(mapRedraw);
        } else {
            const rect = mapSelectLang.getBoundingClientRect(); // Get canvas position relative to viewport
            const mouseX = e.clientX - rect.left; // Calculate mouse position relative to canvas
            const mouseY = e.clientY - rect.top;
            mapMove(mouseX, mouseY);
        }
    });

    var map_Touches = -1;
    var map_TouchStartX, map_TouchStartY;
    var map_MoveTime;
    mapSelectLang.addEventListener('touchstart', (e) => {
        //start move
        const rect = mapSelectLang.getBoundingClientRect();
        var touch1 = e.touches[0] || e.changedTouches[0];
        let mx = touch1.pageX,
            my = touch1.pageY - rect.top;

        if (e.touches.length == 1) {
            console.log("touchstart move");
            e.preventDefault();
            moved = true;

            map_LocTmpX = mx - map_LocX;
            map_LocTmpY = my - map_LocY;

            map_TouchStartX = mx;
            map_TouchStartY = my;
            map_MoveTime = Date.now();
            map_Touches = 1;
            window.requestAnimationFrame(mapRedraw);
        } else {
            console.log("touchstart zoom");
            var touch2 = e.touches[1] || e.changedTouches[1];
            let m2x = touch2.pageX,
                m2y = touch2.pageY - rect.top;
            map_Touches = 2;
            e.preventDefault();

            // nastav hodnoty začáteční pozice
            map_LocTmpX = mx - map_LocX;
            map_LocTmpY = my - map_LocY;
            map_LocTmp2X = m2x - map_LocX;
            map_LocTmp2Y = m2y - map_LocY;
            map_ZoomInit = map_Zoom;
        }
    });

    mapSelectLang.addEventListener('touchend', (e) => {
        console.log("touchend");
        var touch = e.touches[0] || e.changedTouches[0];
        const rect = mapSelectLang.getBoundingClientRect();

        // Jeden prst
        if (map_Touches == 1) {
            let mx = touch.pageX;
            let my = touch.pageY - rect.top;

            if (map_Touches == 2) {
                map_LocX -= map_LocTmpX;
                map_LocY -= map_LocTmpY;

                map_LocTmpX = 0;
                map_LocTmpY = 0;
                map_Touches = 1;
            }

            // <300ms kliknutí
            if ((Date.now() - map_MoveTime) < 300) {
                // <10px vzdálenost od začátku 
                let dX = mx - map_TouchStartX,
                    dY = my - map_TouchStartY;
                let d = Math.sqrt(dX * dX + dY * dY);
                if (d < 10) {
                    console.log("click!");
                    mapClick(mx, my);
                    return;
                }
            }
            map_Touches = 1;
        }

        window.requestAnimationFrame(mapRedraw);
    });
    let map_ZoomInit;
    mapSelectLang.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = mapSelectLang.getBoundingClientRect();


        if (e.touches.length == 1) {
            console.log("mousemove move");
            var touch = e.touches[0] || e.changedTouches[0];
            let mx = touch.pageX,
                my = touch.pageY - rect.top;

            if (moved) {
                map_LocX = mx - map_LocTmpX;
                map_LocY = my - map_LocTmpY;

                window.requestAnimationFrame(mapRedraw);
            } else {
                mapMove(touch.pageX, touch.pageY);
            }
            map_Touches = 1;
        } else if (e.touches.length == 2) {
            console.log("mousemove zoom");
            var touch1 = e.touches[0] || e.changedTouches[0];
            let m1x = touch1.pageX,
                m1y = touch1.pageY - rect.top;

            var touch2 = e.touches[1] || e.changedTouches[1];
            let m2x = touch2.pageX,
                m2y = touch2.pageY - rect.top;

            // start
            if (map_Touches != 2) {
                map_LocTmpX = m1x - map_LocX;
                map_LocTmpY = m1y - map_LocY;
                map_LocTmp2X = m2x - map_LocX;
                map_LocTmp2Y = m2y - map_LocY;
                map_ZoomInit = map_Zoom;
                map_Touches = 2;
            } else {
                // start distance
                let dx = map_LocTmpX - map_LocTmp2X,
                    dy = map_LocTmpY - map_LocTmp2Y;

                let start = Math.sqrt(dx * dx + dy * dy);

                // now distance
                dx = (m1x - map_LocX) - (m2x - map_LocX), dy = (m1y - map_LocY) - (m2y - map_LocY);
                console.log(map_LocTmpX, m1x - map_LocX);
                console.log(map_LocTmpY, m1y - map_LocY);
                console.log(map_LocTmp2Y, m2y - map_LocY);
                console.log(map_LocTmp2Y, m2y - map_LocY);
                let now = Math.sqrt(dx * dx + dy * dy);
                let prevZoom = map_Zoom;
                map_Zoom = map_ZoomInit / (start / now);

                // corect center of zoom
                const imgMX = (m1x + m2x) / 2 - map_LocX,
                    imgMY = (m1y + m2y) / 2 - map_LocY;

                const imgPMX = imgMX / (imgMap.width * prevZoom),
                    imgPMY = imgMY / (imgMap.height * prevZoom);

                map_LocX -= (map_Zoom - prevZoom) * imgMap.width * imgPMX;
                map_LocY -= (map_Zoom - prevZoom) * imgMap.height * imgPMY;

                window.requestAnimationFrame(mapRedraw);
            }
        }
    });
	
    let moved;
	
	loaded = true;
}

function mapClick(mX, mY) {
    //let canvasMap = document.getElementById("mapSelectLang");

    map_DisplayWidth = document.getElementById("mapZoom").clientWidth;
    map_DisplayHeight = document.getElementById("mapZoom").clientHeight;

    //mapSelectLang.width = map_DisplayWidth;
    //mapSelectLang.height = map_DisplayHeight;

    // point of location
    let circleRadius = 3 * map_Zoom;
    if (isTouchDevice()) circleRadius *= 3;
    if (circleRadius < 2) circleRadius = 2;
    if (circleRadius > 12) circleRadius = 12;

    // generate dots
    for (let p of languagesList) {
        if (isNaN(p.locationX)) continue;
        if (!(p.Quality == 0 && map_Zoom < 1.5 && !(p.id==selectedLang))){
            if (入っちゃった(mX, mY, map_LocX + p.locationX * map_Zoom - circleRadius, map_LocY + p.locationY * map_Zoom - circleRadius, circleRadius * 2, circleRadius * 2) ||
                (isTouchDevice() && 入っちゃった(mX, mY, map_LocX + p.locationX * map_Zoom - circleRadius, map_LocY + p.locationY * map_Zoom - circleRadius, circleRadius * 2, circleRadius * 2))) {
                console.log("click", { mX: mX, my: mY, x: map_LocX + p.locationX * map_Zoom - circleRadius, y: map_LocY + p.locationY * map_Zoom - circleRadius, w: circleRadius * 2, h: circleRadius * 2 });
                //p.option.selected = true;
                document.getElementById("settingCurrentLang").value=p.id;
                SwitchPage('Basic');
                Translate();
                GetDic()
                return;
            }
        }
    }
}

function 入っちゃった(mx, my, x, y, w, h) {
    //console.log(mx,my, x, y, w, h);
    if (x == undefined) return false;
    if (x == NaN) return false;

    if (mx < x) return false;
    if (my < y) return false;
    if (mx > x + w) return false;
    if (my > y + h) return false;

    //console.log(mx, my, x, y, w, h);
    return true;
}


function _CalculateGeoreferenceOfNewMap(handlovaPxX, handlovaPxY, nymburkPxX, nymburkPxY) {
    // Transformace gps na obrazové body

    // langPointX=(gpsX-xM)*xZ;
    // langPointY=(gpsY-yM)*yZ;	
    // výpočet xM, yM, xZ a yZ
    let mX, mY, zX, zY;

    // Georeferenční místa: handlova + nymburk	
    // handlovaPtX, handlovaPtY, nymburkPtX, nymburkPtY = pozice v px od horního levého okraje 
    let handlovaGpsX = 18.7590888,
        handlovaGpsY = 48.7283153,
        nymburkGpsX = 15.0428904,
        nymburkGpsY = 50.1856607;

    //2 rovnice oo dvou neznámých
    zX = (nymburkPxX - handlovaPxX) / (nymburkGpsX - handlovaGpsX);
    zY = (nymburkPxY - handlovaPxY) / (nymburkGpsY - handlovaGpsY);

    mX = (nymburkGpsX * handlovaPxX - nymburkPxX * handlovaGpsX) / (nymburkPxX - handlovaPxX);
    mY = (nymburkGpsY * handlovaPxY - nymburkPxY * handlovaGpsY) / (nymburkPxY - handlovaPxY);

    return { xM: mX, yM: mY, xZ: zX, yZ: zY }
}

function mapMove(mX, mY) {
  //  let canvasMap = document.getElementById("mapSelectLang");

    let ele = document.getElementById("mapZoom");
    map_DisplayWidth = ele.clientWidth;
    map_DisplayHeight = ele.clientHeight;

    //mapSelectLang.width = map_DisplayWidth;
    //mapSelectLang.height = map_DisplayHeight;

    // point of location
    let circleRadius = 3 * map_Zoom;
    if (circleRadius < 2) circleRadius = 2;
    if (circleRadius > 8) circleRadius = 8;

    // generate dots
    for (let p of languagesList) {
        if (isNaN(p.locationX)) continue;
        if (!(p.Quality == 0 && map_Zoom < 1.5 && !(p.id==selectedLang))){
            if (入っちゃった(mX, mY, map_LocX + p.locationX * map_Zoom - circleRadius, map_LocY + p.locationY * map_Zoom - circleRadius, circleRadius * 2, circleRadius * 2)) {
                if (mapSelectLang.style.cursor != "pointer") mapSelectLang.style.cursor = "pointer";
                return;
            }
        }
    }
    if (mapSelectLang.style.cursor != "move") mapSelectLang.style.cursor = "move";
}

function isTouchDevice() {
    return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
}

function mapRedraw() {
   // let canvasMap = document.getElementById("mapSelectLang");

    let ele = document.getElementById("mapZoom");
    map_DisplayWidth = ele.clientWidth;
    map_DisplayHeight = ele.clientHeight;

    mapSelectLang.width = map_DisplayWidth;
    mapSelectLang.height = map_DisplayHeight;

    let ctx = mapSelectLang.getContext("2d");

    ctx.clearRect(0, 0, mapSelectLang.width, mapSelectLang.height);

    //ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.drawImage(imgMap, map_LocX, map_LocY, imgMap.width * map_Zoom, imgMap.height * map_Zoom);
    ctx.globalAlpha = 1;

    // point of location	
    let circleRadius = 3 * map_Zoom;
    if (isTouchDevice()) circleRadius *= 3;
    if (circleRadius < 2) circleRadius = 2;
    if (circleRadius > 8) circleRadius = 8;
    ctx.lineCap = 'round';

    // generate dots   
    for (const p of languagesList) {
        if (p.Quality == 0 && map_Zoom < 1.5 && !(p.id==selectedLang)) continue;

        //out of map
        if (入っちゃった(map_LocX + p.locationX * map_Zoom + circleRadius * 2, map_LocY + p.locationY * map_Zoom + circleRadius * 2, 0, 0, map_DisplayWidth + circleRadius * 4, map_DisplayHeight + circleRadius * 4)) {

            if (p.id==selectedLang) ctx.fillStyle = "Black";
            else ctx.fillStyle = p.ColorFillStyle;

            ctx.beginPath();
            ctx.arc(map_LocX + p.locationX * map_Zoom /*-circleRadius*/ , map_LocY + p.locationY * map_Zoom /*-circleRadius*/ , circleRadius, 0, 2 * Math.PI);
            ctx.fill();

            ctx.strokeStyle = p.ColorStrokeStyle;
            ctx.stroke();
        }
    }

    if (theme == "dark") ctx.strokeStyle = 'White';
    else ctx.strokeStyle = 'Black';
    ctx.font = "16px sans-serif";

    // generate texts
    let z = dev ? 3.5 : 2.5;
    for (const p of languagesList) {
        if ((map_Zoom > z && p.Quality < 2) || p.Quality >= 2 || p.id==selectedLang) {

            //out of map
            if (入っちゃった(map_LocX + p.locationX * map_Zoom + circleRadius * 2, map_LocY + p.locationY * map_Zoom + circleRadius * 2, 0, 0, map_DisplayWidth + circleRadius * 4, map_DisplayHeight + circleRadius * 4)) {

                // Text color
                if (p.Quality == 0) {
                    if (p.Category === undefined) ctx.fillStyle = "#996666";
                    else ctx.fillStyle = "Gray";
                } else {
                    if (theme == "dark") ctx.fillStyle = "White";
                    else ctx.fillStyle = "Black";
                }
                let w = ctx.measureText(p.Name).width;
                ctx.fillText(p.Name, map_LocX + p.locationX * map_Zoom - w / 2, map_LocY + p.locationY * map_Zoom - circleRadius - 5);
            }
        }
    }
}
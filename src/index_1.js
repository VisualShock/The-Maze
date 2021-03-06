import "./style.css";
// import headerModule from "./header.js";

// const log = txt => console.log(txt);


const canvas = document.querySelector(".canvas");
const ctx = canvas.getContext("2d");
const x = document.querySelector(".colums");
const y = document.querySelector(".rows");
const startButton = document.querySelector(".submit");

canvas.addEventListener("click", handleClick);

function handleClick(evt) {
    // console.log(evt.x, evt.y);

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        console.log("x: " + x + " y: " + y);

}



// Creating two-dimensional array
class Grid {
    constructor(width, height){
        this.width = width;
        this.height = height;
    }
    createGrid(){
        this.drawGrid();
        const newArray = [];
        for(let y = 0; y < this.height; y += 1){
            newArray.push([]);
            for(let x = 0; x < this.width; x += 1){
                newArray[y].push(new Spot(x, y))
            }
        }

        for(let y = 0; y < this.height; y += 1){
            for(let x = 0; x < this.width; x += 1){
                newArray[y][x].addNeighbors(newArray, this.width, this.height);
            }
        }
        // console.log(newArray);
       return newArray;
}
    drawGrid(){
        let wid = this.width;
        let heig = this.height;

        //grid width and height
        const bw = wid*50;
        const bh = heig*50;
        //padding around grid
        const p = 1;
        //size of canvas
        const cw = bw + (p*2);
        const ch = bh + (p*2);

        canvas.setAttribute("width", cw);
        canvas.setAttribute("height", ch);
        for (let x = 0; x <= bw; x += 50) {
            ctx.moveTo(0.5 + x + p, p);
            ctx.lineTo(0.5 + x + p, bh + p);
        }


        for (let x = 0; x <= bh; x += 50) {
            ctx.moveTo(p, 0.5 + x + p);
            ctx.lineTo(bw + p, 0.5 + x + p);
        }
        ctx.strokeStyle = "#d24";
        ctx.stroke();


    }

}


//saving spot properties
class Spot{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.isWall = false;
        this.parent = null;
        this.neighbors = [];
        this.addNeighbors = function (grid, width, height) {
                if(this.y > 0){
                    this.neighbors.push(grid[this.y - 1][this.x]);
                }

                if(this.y < (height - 1)){
                    this.neighbors.push(grid[this.y + 1][this.x]);
                }

                if(this.x > 0){
                    this.neighbors.push(grid[this.y][this.x - 1]);
                }

                if(this.x < (width - 1)) {
                    this.neighbors.push(grid[this.y][this.x + 1]);
                }
        };
    }
}

//Finding all neighbors and returning resulting array
class FindingPath extends  Grid{
    constructor(startX, startY, endX, endY, grid){

        //not dynamic dimensions value ( to fix ) !!!
        super(5, 3);
        this.startX = startX;
        this.startY = startY;
        this.start;
        this.end;
        this.endX = endX;
        this.endY = endY;
        this.grid = grid;
        this.openSet = [];
        for(let i = 0; i < grid.length; i += 1){
            for(let j = 0; j < grid[i].length; j += 1){
                if((grid[i][j].x === this.startX) && (grid[i][j].y === this.startY)){
                    this.start = grid[i][j];
                    this.openSet.push(this.start)
                }
                if((grid[i][j].x === this.endX) && (grid[i][j].y === this.endY)){
                    this.end = grid[i][j];
                }
            }
        }
        this.closedSet = [];
        this.path = [];
    }
    checkNeighbors(){
        while(this.openSet.length > 0){
            let lowestValue = 0;
            for(let i = 0; i < this.openSet.length; i += 1){
                if(this.openSet[i].f < this.openSet[lowestValue].f){
                    lowestValue = i;
                }
            }
            let current = this.openSet[lowestValue];

            if(current === this.end){
                this.findingPath(current);
                console.log("DONE");
                console.log(this.path);
                this.drawPath(this.path, ctx);
                return;
            }
            FindingPath.removeFromArray(this.openSet, current);
            this.closedSet.push(current);

            for(let i = 0; i < current.neighbors.length; i += 1){
                let neighbor = current.neighbors[i];

                if(!this.closedSet.includes(neighbor)){
                    const tempG = current.g + 1;
                    if(this.openSet.includes(neighbor)){
                        if(tempG < neighbor.g){
                            neighbor.g = tempG;
                        }
                    } else{
                        neighbor.g = tempG;
                        this.openSet.push(neighbor);
                    }

                    neighbor.h = FindingPath.distanceH(neighbor.x, neighbor.y, this.endX, this.endY);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.parent = current;

                }
            }
        }

    }
    drawPath(arr, canvas2D){
        // ctx.fillRect((canvas2D[0].x*50)+2, (canvas2D[0].y*50)+2, 48, 48);
        // ctx.fillRect((canvas2D[canvas2D.length - 1].x*50)+2, (canvas2D[canvas2D.length - 1].y*50)+2, 48, 48);
        arr.forEach(el => {
            const x = el.x*50;
            const y = el.y*50;
            canvas2D.fillStyle = "#d24";
            canvas2D.fillRect(x + 2, y + 2, 50, 50 )
        })
    }
    static distanceH(startX, startY, endX, endY){
        const xRes = endX - startX;
        const yRes = endY - startY;
        return Math.abs(xRes + yRes);
    }

    static removeFromArray(arr, elem) {
        for (var i = arr.length - 1; i >= 0; i--) {
            if (arr[i] === elem) {
                arr.splice(i, 1);
            }
        }
    }

    findingPath(current){
       let temp = current;
       this.path.push(temp);
       while(temp.parent){
           this.path.push(temp.parent);
           temp = temp.parent;
       }
    }



}

startButton.addEventListener("click", handleStart);
function handleStart(evt) {
    const target = evt.target;
    if(target.nodeName === "BUTTON"){
        console.log(x.value, y.value)
        const FP = new Grid(x.value, y.value);
        const arr = FP.createGrid();
        new FindingPath(5, 5, 5, 9, arr).checkNeighbors();
        console.log(arr);
    }
}



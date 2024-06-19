
const container = document.getElementById('container')
const canvas = document.createElement('canvas')
canvas.classList.add('canvas-rect')
const canvasImg=document.createElement('canvas')
canvasImg.classList.add('canvas-img')
const ctx = canvas.getContext('2d')
const scale=document.getElementById('scale')
const ctxImg=canvasImg.getContext('2d')
const scaleInfo=document.getElementById('scale-info')
const imageInfo=document.getElementById('image-info')
const objectForm=document.getElementById('object-form')
const uploadFile=document.getElementById('uploadFile')
const nextImage=document.getElementById('next-image')
var scaleX;
var scaleY;


function getTransformedPoint(x, y) {
  let rect=canvas.getBoundingClientRect();
  scaleX=canvas.width/rect.width;
  scaleY=canvas.height/rect.height;
  return {
    x: (x-rect.left)*scaleX,
    y: (y-rect.top)*scaleY,
  }
}
let start=0;
uploadFile.addEventListener('change',function(e)
{
    if (e.target.files.length==0) return

    const files=e.target.files
    var file;
    nextImage.addEventListener('click',function(e){

     file=files[start]
     const reader=new FileReader()
         reader.onload=function()
              {
                     updateImage(event.target.result)
              }
         reader.readAsDataURL(file)
    start++
    })
})

function generateObjectForm(id,data){
  
  objectForm.innerHTML += `
    <div class="form-row mb-3">
            <div class="form-group col-md-6">
              <label for="object">Object ${id}</label>
              <input type="text" class="form-control" name="object-${id}" id="object-${id}">

            </div>
            <div class="form-group col-md-6 bounding-box">
            <label> Bounding  box coordinates (pixels)</label>
            <br>
            <label for="object-${id}-x0">X0</label>
              <input type="number" class="form-control" name="object-${id}-x0" id="object-${id}-x0" value=${data.x} disabled>
              <label for="object-${id}-y0">Y0</label>
              <input type="number" class="form-control" name="object-${id}-y0" id="object-${id}-y0" value=${data.y} disabled>
              <label for="object-${id}-w">Width</label>
              <input type="number" class="form-control" name="object-${id}-w" id="object-${id}-w" value=${data.w} disabled>
               <label for="object-${id}-h">Height</label>
              <input type="number" class="form-control" name="object-${id}-h" id="object-${id}-h" value=${data.h} disabled>
            </div>
      </div>`
  
}

function updateImage(result){
  const img = new Image()
  img.src = result
  img.onload = function(){

    const scaleValue=scale.value
    const width = img.width
    const height = img.height
    imageInfo.innerHTML = `Image: ${width} x ${height} px`
    canvasImg.width = width
    canvasImg.height = height
    canvas.width = width
    canvas.height = height
    container.style.width = `${width}px`
    container.style.height = `${height}px`
    ctxImg.drawImage(img, 0, 0, width, height)
    
  }
  container.appendChild(canvasImg)
  container.appendChild(canvas) 
  drawRect()
}

scale.addEventListener('change', function(e) {
  let scaleValue = scale.value
  container.style.transform = `scale(${scaleValue})`
  scaleInfo.innerHTML = `Scale: ${scaleValue}`
  let rect=canvas.getBoundingClientRect();
  scaleX=canvas.width/rect.width;
  scaleY=canvas.height/rect.height;
  
 
})

function drawRect(){


let canvasOffset = {
  x: canvas.offsetParent.offsetLeft,
  y: canvas.offsetParent.offsetTop,
}

let dragging = false
let draggStart = {}
let draggEnd = {}
let rectCache = []

canvas.addEventListener('mousedown', function(e) {
  let coords = getTransformedPoint(e.clientX, e.clientY)
  
  draggStart = {
    x: parseInt(coords.x),
    y: parseInt(coords.y),
  }
  dragging = true
})

canvas.addEventListener('mouseup', function(e) {
  if (!dragging) return
  let coords = getTransformedPoint(e.clientX, e.clientY)
  dragging = false
  draggEnd = {
    x: parseInt(coords.x),
    y: parseInt(coords.y),
  }
  let diff = {
    x: draggEnd.x - draggStart.x,
    y: draggEnd.y - draggStart.y,
  }

  rectCache.push({
    x: draggStart.x,
    y: draggStart.y,
    w: diff.x,
    h: diff.y,
  })
  generateObjectForm(rectCache.length,rectCache[rectCache.length-1])
  
  refleshCanvas()
})

canvas.addEventListener('mousemove', function(e) {
  if (!dragging) return
  let coords = getTransformedPoint(e.clientX, e.clientY)
  let current = {

    x: parseInt(coords.x),
    y: parseInt(coords.y),
  }
  let diff = {
    x: current.x - draggStart.x,
    y: current.y - draggStart.y,
  }

  refleshCanvas()

  ctx.save()
  ctx.beginPath()
  ctx.lineWidth = .5
  ctx.setLineDash([7, 2])
  ctx.rect(draggStart.x, draggStart.y, diff.x, diff.y)
  ctx.strokeStyle = 'rgb(255, 82, 0)'
  ctx.stroke()
  ctx.restore()
})

canvas.addEventListener('mouseleave', function() {
  if (!dragging) return

  dragging = false
  refleshCanvas()
})

document
  .getElementById('prev')
  .addEventListener('click', function() {
    if (rectCache.length !== 0) rectCache.pop()
    let lastObject=objectForm.querySelector(`#object-${rectCache.length+1}`)
    
    if (lastObject!=null) 
      {

        lastObject.parentNode.remove()
       }

    refleshCanvas()
    
  })

document
  .getElementById('clear')
  .addEventListener('click', function() {
    clearCanvas()
    rectCache = []
    objectForm.querySelectorAll('.form-row').forEach(function(row){
      row.remove()
    })
  })

function clearCanvas() {
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}
function refleshCanvas() {
  clearCanvas()

  rectCache.forEach(function(rect,index) {
    
    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)'
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h)

    ctx.font = "100px Arial";
    ctx.fillText(`Object ${index+1}`, rect.x + 10, rect.y -10) 
    
  })
}
}

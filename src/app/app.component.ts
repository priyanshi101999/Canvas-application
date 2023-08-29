import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { io } from 'socket.io-client'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'canvas';

  // Connect to the Socket.IO server
  socket: any = io('http://localhost:3000')

  @ViewChild('canvas', { static: true }) canvasElement !: ElementRef<HTMLCanvasElement>;
  private context: any = CanvasRenderingContext2D;
  private isDrawing = false;




  ngOnInit(): void {

    if (this.context) {
      this.context = this.canvasElement.nativeElement.getContext('2d');
    } else {
      throw new Error('Canvas 2D context is not available.');
    }

    this.setupCanvas();

    // Listen for "draw-broadcast-start" event from the server
    this.socket.on("draw-broadcast-start", (data: any) => {
      this.context.moveTo(data.x, data.y);

    })

    // Listen for "draw-broadcast-move" event from the server
    this.socket.on("draw-broadcast-move", (data: any) => {
      this.context.lineTo(data.x, data.y);
      this.context.stroke();
    })
  }

  private setupCanvas(): void {
    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';
    this.context.lineWidth = 5;
  }

  onMouseDown(event: MouseEvent): void {
    this.isDrawing = true;
    const x = event.clientX;
    const y = event.clientY

    // Start a new path at the clicked coordinates
    this.context.moveTo(x, y);

    // Emit "draw-start" event to the server
    this.socket.emit('draw-start', { x: x, y: y })

  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDrawing) return;
    const x = event.clientX 
    const y = event.clientY 

    // Continue the path to the moved coordinates
    this.context.lineTo(x, y);

    // Draw the path
    this.context.stroke();

    // Emit "draw-move" event to the server
    this.socket.emit('draw-move', { x: x, y: y })
  }

  onMouseUp(): void {
    this.isDrawing = false;
  }


}







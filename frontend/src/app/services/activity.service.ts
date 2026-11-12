// noinspection JSUnusedGlobalSymbols

import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  activities = signal<any[]>([]);

  connectToActivityStream() {
    // Native EventSource for Server-Sent Events
    const eventSource = new EventSource('http://localhost:5000/api/activity/stream', {
      withCredentials: true // passes cookies if needed
    });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type) {
        this.activities.update(current => [data, ...current.slice(0, 9)]); // Keep last 10 activities
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Connection Error:', error);
      eventSource.close();
    };
  }
}

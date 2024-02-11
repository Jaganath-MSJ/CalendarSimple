# Calendar App

A user-friendly calendar app for viewing, selecting, and managing dates with data management capabilities.

## Features

- View and navigate through a monthly calendar
- Select dates and manage selected dates
- Customizable styling with Styled Components
- Support for data management and event handling
- Easy integration into React projects
- Lightweight and minimal dependencies

## Tech Stack
- React JS
- TypeScrpit
- Styled Component
- Moment.js

## Key Features

- **Monthly Calendar View:** Navigate through a monthly calendar with ease.
- **Date Selection:** Select single or multiple dates from the calendar.
- **Data Management:** Add, update, or remove data associated with selected dates.
- **Custom Styling:** Easily customize the calendar appearance using Styled Components.
- **Event Handling:** Handle user interactions and events seamlessly within the calendar component.

## Installation
    npm install --save calendar-simple

## Usage
    import React from 'react';
    import { Calendar } from 'calendar-simple';

    const App: React.FC = () => {
        return (
            <div>
            <h1>Calendar App</h1>
            <Calendar />
            </div>
        );
    };

    export default App;

## Demo
For a live demonstration, you can visit [Demo Link](http://calendarsimple.netlify.app).

## License
This project is licensed under the MIT License - see the LICENSE file for details.

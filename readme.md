Lights Out game built using React as part of Udemy course - The Modern React Bootcamp (Hooks, Context, NextJS, Router) by Colt Steele

Starter code that I was given is provided in zip file for comparison to my implementation.

I decided to approach this exercise as an opportunity to work within a pre-defined framework via the starter code. This gave me certain constraints that were pre-determined by said starter code as far as method parameters and how data flowed. Most of my projects are built from scratch, since I work independently, so I saw this as a good opportunity to try building off of something that someone else made.

The Board component handles all the logic and merely passes whether or not a given Cell is lit through props (as well as its click event handler).

The createBoard() method creates a new board with a number of cells already lit, where the number of cells already lit is a random number between the lowerBound and upperBound provided via props. A minimum number of "turns" are simulated to ensure that the board looks random enough.

The flipCellsAround method is assigned as the click handler to each Cell component. The method does exactly what it says and toggles the lit status of the clicked Cell and its neighbors.
Sarah Hatch
May 2026
IMGD / CS 4300

Multi-Typed Slime Mold Simulations

Resources and Credits:
[Original Physarum Code from Charlie Robert's seagullls](https://codeberg.org/charlieroberts/seagulls/src/branch/main/demos/7_physarum/main.js)

Project:
I expanded the slime mold Physarum code to have three different slime mold types that can interact with each other. All the slime molds types run useing the same compute shader and render shader. I did this by expanding the phermone buffer to contain a channel for each slime mold type. Currently there are three slime mold types running. Type is stored by each slime mold agent (titled Vant in the code as this was originally based off of Vant ant simulations). Depending on the slime type the simulation chooses which channel to read and write from. In this iteration each slime mold can only write to its own channel, however they read from all of the phermones at a given point. 

Each slime mold type has a definition in a seperate array buffer. This is effectivly a very simple relational database where Vants have a many to one relationship to their type descriptions. Type Descriptions contain infromation on the turn radius, diffuse strength, scan distance, display color, and reaction type. Diffuse strength is not exposed to the UI.  The reaction type defines what the slime will do when encountering a different phermone. They may IGNORE, not consider the other phermones in calculation, AVOID, steer away from other pheromones or FOLLOW and steer towards the other pheromones. 
The UI exposes the type description to the user for live manipulation of values. At this time the program is set to have three types. This could be expanded in the future as most of the logic revolve around run time constants. A few do not but could be adapted.

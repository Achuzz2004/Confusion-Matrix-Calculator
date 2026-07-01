
# Confusion Matrix Calculator

A simple web-based tool for generating, visualizing, and exporting confusion matrices for classification tasks.

## What this project does

This app helps you:
- create an $N \times N$ confusion matrix from your chosen class count, sample size, and target accuracy
- explore balanced, imbalanced, or custom class distributions
- calculate common classification metrics such as accuracy, precision, recall, specificity, and F1-score
- view the matrix with visual charts and export the results in useful formats

## Features

- Generate realistic confusion matrices directly in the browser
- Adjust parameters such as number of classes, total samples, and target accuracy
- Switch between balanced, imbalanced, and custom distributions
- Edit matrix values and see metrics update instantly
- Export results as Python, NumPy, or CSV data

## How to use it

1. Open the app in your browser by loading the file in the Confusion Matrix folder.
2. Set the number of classes, total samples, target accuracy, and distribution type.
3. Click Generate Matrix to create the matrix.
4. Review the metrics and export the output if needed.

## Project structure

- Confusion Matrix/index.html — main app page
- Confusion Matrix/js/ — JavaScript logic for generation, rendering, metrics, and export
- Confusion Matrix/css/ — styling for the interface

## Run locally

You can open [Confusion Matrix/index.html](Confusion%20Matrix/index.html) directly in a browser. No build step is required.

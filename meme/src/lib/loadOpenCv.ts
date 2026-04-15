let openCvPromise: Promise<any> | null = null;

declare global {
    interface Window {
        cv: any;
    }
}

export function loadOpenCv(): Promise<any> {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("OpenCV only works in the browser."));
    }
    if (window.cv && window.cv.Mat) {
        return Promise.resolve(window.cv);
    }

    if (openCvPromise) {
        return openCvPromise;
    }
    
    openCvPromise = new Promise((resolve, reject) => {
        const existingScript = document.getElementById("opencv-script");
        
        if (existingScript) {
        waitForOpenCv(resolve, reject);
        return;
        }

        const script = document.createElement("script");
        script.id = "opencv-script";
        script.src = "https://docs.opencv.org/4.x/opencv.js";
        script.async = true;

        script.onload = () => {
        waitForOpenCv(resolve, reject);
        };

        script.onerror = () => {
        reject(new Error("Failed to load OpenCV.js"));
        };

        document.body.appendChild(script);
    });
    
    return openCvPromise;
}

function waitForOpenCv(
    resolve: (cv: any) => void,
    reject: (reason?: any) => void
)   {
    
    const start = Date.now();
    
    function check() {

        if (window.cv && window.cv.Mat) {
        resolve(window.cv);
        return;
        }

        if (Date.now() - start > 15000) {
        reject(new Error("OpenCV.js took too long to initialize."));
        return;
        }

        requestAnimationFrame(check);
    }

    check();
}
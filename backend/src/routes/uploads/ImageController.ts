import { Request, Response, NextFunction } from 'express';
 
export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("Hello");
        if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
        }
        const imageUrl = `/uploads/${req.file.filename}`; // Construct file URL
    
        res.status(200).json({
        message: 'Image uploaded successfully',
        imageUrl,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
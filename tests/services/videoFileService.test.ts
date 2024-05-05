import { createVideoFile, extractFileNameFromURL } from '../../services/videoFileService';
import { prismaMock } from '../../singleton';

describe('extractFileNameFromURL', () => {
    test('Test normal URL', () => {
        let url = "https://storagebortube.blob.core.windows.net/bortube-container/3_bee.mp4";
        let expectFileName = "3_bee.mp4";
        expect(extractFileNameFromURL(url)).toBe(expectFileName);
    });
});

describe('createVideoFile', () => {
    test("Should create new videoFile", async () => {
        const videoFile = {
            id: 1,
            duration: 60,
            videoUrl: "bortube.com"
        }

        prismaMock.videoFile.create.mockResolvedValue(videoFile);

        await expect(createVideoFile(60, "", 1)).resolves.toEqual({
            id: 1,
            duration: 60,
            videoUrl: "bortube.com"
        })
    })
})
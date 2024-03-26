const usedImageUrls = new Set();
function getNextImageUrl(chatLog, currentIndex) {
    // Start looking for the next image URL after the current text entry.
    for (let i = currentIndex + 1; i < chatLog.length; i++) {
        if (chatLog[i].message.startsWith('Image URL: ') && !usedImageUrls.has(chatLog[i].message)) {
            // Once found, add it to the set to mark it as used and return the URL.
            usedImageUrls.add(chatLog[i].message);
            return chatLog[i].message.replace('Image URL: ', '');
        }
    }
    return null; // Return null if there's no image URL after the current text entry.
}
app.post('/generate-pdf', async (req, res) => {
    const { chatLog, requestedPages } = req.body;

    const doc = new PDFDocument();
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment;filename=storybook.pdf',
        }).end(pdfData);
    });

    // Sort and select text responses
    let selectedTextResponses = chatLog.filter(entry => entry.role === 'gpt' && !entry.message.startsWith('Image URL: '))
                                       .map((entry, index) => ({ ...entry, originalIndex: index }))
                                       .sort((a, b) => b.message.length - a.message.length)
                                       .slice(0, requestedPages)
                                       .sort((a, b) => a.originalIndex - b.originalIndex);

    // Process each selected text response and fetch its corresponding image
    for (const response of selectedTextResponses) {
        // Add text to the PDF
        doc.addPage();
        doc.font('Times-Roman').fontSize(14).fillColor('blue');
        doc.text(response.message, {
            paragraphGap: 5,
            indent: 20,
            align: 'justify',
            columns: 1,
        });
        // Fetch the image associated with this text entry
        let imageUrl = getNextImageUrl(chatLog, response.originalIndex);

        // Check if an image URL was returned and has not been used already.
        if (imageUrl) {
            try {
                const imageResponse = await fetch(imageUrl);
                if (imageResponse.ok) {
                    const imageBuffer = await imageResponse.buffer();
                    // Add the image on a new page in the PDF.
                    doc.addPage().image(imageBuffer, { fit: [500, 500], align: 'center', valign: 'center' });
                } else {
                    console.error("Failed to load image for PDF:", imageResponse.status);
                }
            } catch (error) {
                console.error("Error fetching image for PDF:", error);
            }
        }
    }
    // Finalize the PDF
    doc.end();
});
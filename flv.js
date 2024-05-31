const fs = require('fs');

function parseFLV(filePath) {
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filePath, { highWaterMark: 1024 * 1024 });
        let headerParsed = false;
        let partialData = Buffer.alloc(0);
        let position = 0;
        let tags = [];

        stream.on('data', (chunk) => {
            let buffer = Buffer.concat([partialData, chunk]);

            if (!headerParsed && buffer.length >= 9) {
                // 解析 FLV 头部
                buffer = buffer.slice(9);
                headerParsed = true;
            }

            while (position <= buffer.length) {
                if (buffer.length - position < 15) {
                    // 不足以读取一个完整的标签头，等待下一次数据
                    partialData = buffer.slice(position);
                    position = 0;
                    break;
                }

                let previousTagSize = buffer.readUInt32BE(position);
                position += 4;

                let tagType = buffer[position];
                let dataSize = (buffer[position + 1] << 16) | (buffer[position + 2] << 8) | buffer[position + 3];
                let timestamp = ((buffer[position + 4] & 0xFF) << 16) | ((buffer[position + 5] & 0xFF) << 8) | (buffer[position + 6] & 0xFF);
                timestamp |= (buffer[position + 7] << 24); // Extend to 32 bits

                // 增加基本的错误检查
                if (tagType !== 8 && tagType !== 9 && tagType !== 18) {
                    partialData = Buffer.alloc(0);
                    break;
                }

                let data = buffer.slice(position + 11, position + 11 + dataSize);

                tags.push({ tagType, dataSize, timestamp, position, data });
                position += 11 + dataSize;
            }

            if (position >= buffer.length) {
                position -= buffer.length;
                partialData = Buffer.alloc(0);
            }
        });

        stream.on('end', () => {
            resolve(tags);
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
}

const crypto = require('crypto');

function hashData(data) {
    return crypto.createHash('md5').update(data).digest('hex');
}

async function mergeFLVFiles(file1, file2, outputFilePath) {
    const tags1 = await parseFLV(file1);
    const tags2 = await parseFLV(file2);

    // 查找重叠部分
    let overlapIndex1 = -1;
    let overlapIndex2 = -1;

    for (let i = 0; i < tags1.length; i++) {
        for (let j = 0; j < tags2.length; j++) {
          // ignore script tag
          if (tags1[i].tagType === 18 || tags2[j].tagType === 18) {
            continue;
          }
            if (hashData(tags1[i].data) === hashData(tags2[j].data)) {
                overlapIndex1 = i;
                overlapIndex2 = j;
                break;
            }
        }
        if (overlapIndex1 !== -1) break;
    }

    if (overlapIndex1 === -1 || overlapIndex2 === -1) {
        console.error('No overlap found between the two files.');
        return;
    }

    console.log('Overlap found at tag index', overlapIndex1, 'in', file1, 'and tag index', overlapIndex2, 'in', file2);

    // // 合并文件
    // const writeStream = fs.createWriteStream(outputFilePath);

    // const stream1 = fs.createReadStream(file1, { start: 0, end: tags1[overlapIndex1].position - 1 });
    // const stream2 = fs.createReadStream(file2, { start: tags2[overlapIndex2].position });

    // stream1.pipe(writeStream, { end: false });
    // stream1.on('end', () => {
    //     stream2.pipe(writeStream);
    // });

    // stream2.on('end', () => {
    //     writeStream.end();
    //     console.log('FLV files merged successfully.');
    // });

    // writeStream.on('error', (err) => {
    //     console.error('Error writing merged FLV file:', err);
    // });
}

mergeFLVFiles(process.argv[2], process.argv[3]);

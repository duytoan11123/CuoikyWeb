const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

async function translateVietnameseWord(req, res) {
  const word = req.body.word;
  const url = `http://vdict.com/${encodeURIComponent(word)},1,0,0.html`;
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0", // tránh bị chặn bởi bot filter
      },
    });

    const $ = cheerio.load(response.data);
    const result = [];
    const academicDefinition = $("#academicDefinition");
    $(academicDefinition)
      .find(".word-type-section")
      .each((_, section) => {
        let meaning;
        const partOfSpeech = $(section).find(".word-type").text().trim();
        $(section)
          .find("ol.meanings-list li.meaning")
          .each((_, meaningEl) => {
            $(meaningEl)
              .find(".meaning-value")
              .each((_, meaningVl) => {
                meaning = $(meaningVl)
                  .contents()
                  .map((_, el) => {
                    return $(el).text();
                  })
                  .get()
                  .join("")
                  .trim();
              });
          });
        if (meaning) {
          result.push({ partOfSpeech, meaning });
        }
      });
      console.log("Kết quả khi gọi api translate: ",word, result);
    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy nghĩa từ vdict.com" });
    }

    res.json({
      word,
      results: result,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Đã xảy ra lỗi khi lấy dữ liệu từ vdict.com" });
  }
}

async function getExample(req, res) {
  const word = req.body.word;
  const url = `http://vdict.com/${encodeURIComponent(word)},1,0,0.html`;
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0", // tránh bị chặn bởi bot filter
      },
    });

    const $ = cheerio.load(response.data);
    const result = [];
    const academicDefinition = $("#academicDefinition");
    $(academicDefinition)
      .find(".word-type-section")
      .each((_, section) => {
        let example;
        const partOfSpeech = $(section).find(".word-type").text().trim();
        console.log("Section:", partOfSpeech);
        $(section)
          .find("ol.meanings-list ul.examples-list")
          .each((_, meaningEl) => {
            console.log("Example count:", $(section).find("li.example").length);
            $(meaningEl)
              .find("li.example div:not([class])")
              .each((_, exampleVl) => {
                example = $(exampleVl)
                  .contents()
                  .map((_, el) => {
                    return $(el).text();
                  })
                  .get()
                  .join("")
                  .trim();
              });
          });
        if (example) {
          result.push({ partOfSpeech, example });
        }
      });
      console.log("Kết quả từ getExample: ", result);
    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy ví dụ từ vdict.com" });
    }

    res.json({
      word,
      results: result,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Đã xảy ra lỗi khi lấy dữ liệu từ vdict.com" });
  }
}
module.exports = {translateVietnameseWord, getExample};

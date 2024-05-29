class ResponseData {
  answer: string;
  source: string;

  constructor(data: any) {
    this.answer = data.answer;
    this.source = data.sources;
  }
}
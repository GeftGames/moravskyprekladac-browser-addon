var idPops = 0;
let SimplyfiedReplacedRules = [];
var ItemNoun_pattensFrom, ItemNoun_pattensTo;
var ItemAdjective_pattensFrom, ItemAdjective_pattensTo;
var ItemPronoun_pattensFrom, ItemPronoun_pattensTo;
var ItemNumber_pattensFrom, ItemNumber_pattensTo;
var ItemVerb_pattensFrom, ItemVerb_pattensTo;

String.prototype.replaceAll = function(find, replace) {
    var str = this;
    return str.replace(new RegExp(find, 'g'), replace);
};

class ItemSentence {
    constructor() {
        this.input = "";
        this.output = [];
    }

    static Load(data) {
        let raw = LoadDataLineString(data,sSentence).split('|');
        if (raw[0] == '') return null;
        let item = new ItemSentence();
        item.input = raw[0];
        item.output = FastLoadTranslateTo(raw, 2);
        if (item.output == null) return null;
        return item;
    }
}

class ItemSentencePart {
    constructor() {
        this.input = null;
        this.output = null;
    }

    static Load(data) {
        let raw = LoadDataLineString(data,sSentencePart).split('|');
        let item = new ItemSentencePart();

        if (raw[0] == '') return null;
        item.input = raw[0];

        item.show = raw[1] == "1";
        item.output = FastLoadTranslateTo(raw, 2);
        if (item.output!=null) return item;
    }
}

class ItemPatternNoun {
    constructor() {
        this.Name = "";
        this.Gender = "";
        this.Shapes = [];
    }

    static Load(data,shortcuts) {
        let raw = LoadDataLinePattern(data,shortcuts).split('|');
        //	if (raw.length != 14 + 2) {
        //if (dev)console.log("PatternNoun - Chybná délka");
        //	return null;
        //}
        let item = new ItemPatternNoun();
        item.Name = raw[0];
        if (raw[1] == "0") item.Gender = "n";
        if (raw[1] == "1") item.Gender = "f";
        if (raw[1] == "2") item.Gender = "ma";
        if (raw[1] == "3") item.Gender = "mi";

        item.Shapes = LoadArr(raw, 14, 2);


        /*	for (let i=2; i<=15 && i<raw.length; i++) {
        		let rawShapes=raw[i];
        		if (!rawShapes.includes(",")) {
        			if (rawShapes.startsWith("?×")){
        				let cntRaw=rawShapes.substring(2);
        				let cnt=parseInt(cntRaw);
        				for (let j=0; j<cnt; j++) item.Shapes.push("?");
        				i+=cnt;
        				continue;
        			} else if (rawShapes.startsWith("-×")){
        				let cntRaw=rawShapes.substring(2);
        				let cnt=parseInt(cntRaw);
        				for (let j=0; j<cnt; j++) item.Shapes.push("-");
        				i+=cnt;
        				continue;
        			}
        		}

        	//	for (let r of raw[i].split(',')) {				
        	//		add.push(r);
        		//}
        		item.Shapes.push(rawShapes.split(','));

        		/*for (let r of raw[i].split(',')) {
        			if (r.includes("?")) unknown=true;
        			else add.push(r);
        		}

        		if (unknown) {
        			 if (add.length>0) item.Shapes.push(add); // např jeden neznámý + jeden známý
        			 else item.Shapes.push("?");
        		} else item.Shapes.push(add);*/
        //	}
        if (item.Shapes.length != 14) {
            if (dev) console.log("PatternNoun - Chybná délka", item.Shapes);
            return null;
        }
        //	item.Shapes = [raw[2].split(','), raw[3].split(','), raw[4].split(','), raw[5].split(','), raw[6].split(','), raw[7].split(','), raw[8].split(','), raw[9].split(','), raw[10].split(','), raw[11].split(','), raw[12].split(','), raw[13].split(','), raw[14].split(','), raw[15].split(',')];
        return item;
    }

    GetShapeTr(starting, fall) {
        let shapes = this.Shapes[fall];
        if (!Array.isArray(shapes)) shapes = [shapes];
        let out = "";
        for (let i = 0; i < shapes.length; i++) {
            let shape = shapes[i];
            if (shape != "?" && shape != "-") {
                out += starting + shape;
            }
            if (i != shapes.length - 1) out += ", ";
        }
        if (out == "") return undefined;
        return ApplyPostRules(out);
    }

    GetShape(starting, fall) {
        let shapes = this.Shapes[fall];
        if (!Array.isArray(shapes)) shapes = [shapes];
        let out = "";
        for (let i = 0; i < shapes.length; i++) {
            let shape = shapes[i];
            if (shape != "?" && shape != "-") {
                out += starting + shape;
            }
            if (i != shapes.length - 1) out += ", ";
        }
        if (out == "") return undefined;
        return out;
    }

    GetShapeFirst(starting, fall) {
        let shapes = this.Shapes[fall];
        if (!Array.isArray(shapes)) shapes = [shapes];

        for (let i = 0; i < shapes.length; i++) {
            let shape = shapes[i];
            if (shape != "?" && shape != "-") {
                return starting + shape;
            }
        }
        return undefined;
    }
}

class ItemNoun {
    constructor() {
        this.UppercaseType = -1;

        this.From = "";
        this.PatternFrom = null;
        this.To = [];
    }

    static Load(data) {
        let raw = data.split('|');

        let item = new ItemNoun();
        item.From = raw[0];

        let paternFrom = this.GetPatternByNameFrom(raw[1]);
        if (paternFrom == null) {
            if (dev) console.log("Cannot load pattern '" + raw[1] + "'");
            return null;
        }
        item.PatternFrom = paternFrom;
        item.UppercaseType = parseInt(raw[2]);

        let to = FastLoadTranslateToWithPattern(raw, 3, this);
        if (to == null) {
            if (dev) console.log("Cannot load to '" + data + "'");
            return null;
        }
        item.To = to;

        return item;
    }

    static GetPatternByNameFrom(name) {
        if (name == "") return null;
        for (const p of ItemNoun_pattensFrom) {
            if (p.Name == name) return p;
        }
    }

    static GetPatternByNameTo(name) {
        if (name == "") return null;
        for (const p of ItemNoun_pattensTo) {
            if (p.Name == name) return p;
        }
    }

    GetWordTo(number, fall) {
        //if (dev) console.log("GetWordTo",this, number, fall);
        //	for (let )
        if (this.To.Pattern == null) {
            throw Exception(PatternTo + " is null");
            return this.To;
        }

        //	console.log("Returning",this, number, fall);
        if (number == undefined) {
            return [this.To + this.PatternTo.Shapes[fall - 1], this.PatternTo.Gender];
        }

        if (number == 1) {
            return [this.To + this.PatternTo.Shapes[fall - 1], this.PatternTo.Gender];
        }
        if (number == 2) {
            return [this.To + this.PatternTo.Shapes[fall + 6], this.PatternTo.Gender];
        }


        if (dev) console.log("⚠️ function 'GetWordTo' has unknown parameter 'number' with value '" + number + "'");
        return [this.To + this.PaternTo.Shapes[fall - 1], this.PaternTo.Gender];
    }

    GetWordFrom(number, fall) {
        if (this.paternFrom == null) return this.From;

        if (number == 1) {
            return [this.From + this.PatternFrom.Shapes[fall - 1], this.PatternFrom.Gender];
        }
        if (number == 2) {
            return [this.From + this.PatternFrom.Shapes[fall + 6], this.PatternFrom.Gender];
        }

        if (dev) console.log("⚠️ function 'GetWordTo' has unknown parameter 'number' with value '" + number + "'");
        return [this.From + this.PatternFrom.Shapes[fall - 1], this.PatternFrom.Gender];
    }

    IsStringThisWord(str) {
        if (this.To === undefined) return null;
        if (this.PatternFrom === undefined) return null;

        // Return all possible falls with numbers
        // [[tvar, číslo, pád], rod]
        // console.log(str,this);
        //console.log(this.From,this);
        if (this.From != "") {
            if (!str.startsWith(this.From)) {
                return null;
            }
        }

        /*	if (this.From=="") {
        		let ret=[];
        		for (let i=0; i<7; i++) {
        			let shapes=this.PatternFrom.Shapes[i];

        			for (let j=0; j<shapes.length; j++) {
        				let shape=shapes[j];
        				//console.log(shape);

        				if (shape==str) {
        					//ret.push(this.To+this.PatternTo.Shapes[i]);
        					if (Array.isArray(this.PatternTo.Shapes[i])) {
        						for (const z of this.PatternTo.Shapes[i]){
        							if (z!='?') ret.push([this.To+z, 1, i+1]); // [tvar, číslo, pád]	
        						}
        					} else {
        						if (shape!="?") ret.push([this.To+this.PatternTo.Shapes[i], 1, i+1]); // [tvar, číslo, pád]	
        					}
        					break;	
        				}
        			}
        		}

        		for (let i=7; i<14; i++) {
        			let shapes=this.PatternFrom.Shapes[i];

        			for (let j=0; j<shapes.length; j++) {
        				let shape=shapes[j];
        			//	console.log(shape);

        				if (shape==str) {
        					//ret.push(this.To+this.PatternTo.Shapes[i]);
        					if (Array.isArray(this.PatternTo.Shapes[i])) {
        						for (const z of this.PatternTo.Shapes[i]){
        							if ('z'!="?") ret.push([this.To+z, 2, i+1-7]); // [tvar, číslo, pád]	
        						}
        					} else if (this.PatternTo.Shapes[i]!="?") ret.push([this.To+this.PatternTo.Shapes[i], 2, i-7+1]);
        					break;
        				}
        			}
        		}

        		if (ret.length==0) return null; else return [ret, this.PatternTo.Gender, this];
        	} else {	*/
        //if (str.startsWith(this.From)) {
        let ret = [];


        for (let i = 0; i < 7; i++) {
            let shapes = this.PatternFrom.Shapes[i];

            if (Array.isArray(shapes)) {
                for (const s of shapes) {
                    if (this.From + s == str) {
                        for (const to of this.To) {
                            let body = to.Body;
                            let pattern = to.Pattern;
                            if (Array.isArray(pattern.Shapes[i])) {
                                for (const z of pattern.Shapes[i]) {
                                    if (z != "?") {
                                        if (z.startsWith("#")) {
                                            ret.push({ Text: body + z.substring(1), Number: 1, Fall: i + 1, Type: "noun", Preposition: true });
                                        } else {
                                            ret.push({ Text: body + z, Number: 1, Fall: i + 1, Type: "noun", Preposition: false });
                                        }
                                    }
                                }
                            } else if (pattern.Shapes[i] != "?") ret.push({ Text: body + pattern.Shapes[i], Number: 1, Fall: i + 1, Type: "noun" });
                        }
                    }
                }
            } else {
                if (this.From + this.PatternFrom.Shapes[i] == str) {
                    for (const to of this.To) {
                        let body = to.Body;
                        let pattern = to.Pattern;
                        if (pattern == undefined) continue;
                        if (Array.isArray(pattern.Shapes[i])) {
                            for (const z of pattern.Shapes[i]) {
                                if (z != "?") {
                                    if (z.startsWith("#")) {
                                        ret.push({ Text: body + z.substring(1), Number: 1, Fall: i + 1, Type: "noun", Preposition: true });
                                    } else {
                                        ret.push({ Text: body + z, Number: 1, Fall: i + 1, Type: "noun", Preposition: false });
                                    }
                                }
                            }
                        } else if (pattern.Shapes[i] != "?") ret.push({ Text: body + pattern.Shapes[i], Number: 1, Fall: i + 1, Type: "noun" });
                    }
                    break;
                }
            }
        }

        for (let i = 7; i < 14; i++) {
            let shapes = this.PatternFrom.Shapes[i];
            if (Array.isArray(shapes)) {
                for (let j = 0; j < shapes.length; j++) {
                    let shape = this.From + shapes[j];

                    if (shape == str) {
                        for (const to of this.To) {
                            let body = to.Body;
                            let pattern = to.Pattern;
                            if (pattern == undefined) continue;
                            if (Array.isArray(pattern.Shapes[i])) {
                                for (const z of pattern.Shapes[i]) {
                                    if (z != "?") {
                                        if (z.startsWith("#")) {
                                            ret.push({ Text: body + z.substring("#"), Number: 2, Fall: i + 1 - 7, Type: "noun", Preposition: true });
                                        } else {
                                            ret.push({ Text: body + z, Number: 2, Fall: i + 1 - 7, Type: "noun", Preposition: false });
                                        }
                                    }
                                }
                            } else if (pattern.Shapes[i] != "?") ret.push({ Text: body + pattern.Shapes[i], Number: 2, Fall: i - 7 + 1, Type: "noun" });
                        }
                        break;
                    }
                }
            } else {
                let shape = this.From + shapes;

                if (shape == str) {
                    for (const to of this.To) {
                        let body = to.Body;
                        let pattern = to.Pattern;
                        if (pattern == undefined) continue;
                        if (Array.isArray(pattern.Shapes[i])) {
                            for (const z of pattern.Shapes[i]) {
                                if (z != "?") {
                                    if (z.startsWith("#")) {
                                        ret.push({ Text: body + z.substring(1), Number: 2, Fall: i + 1 - 7, Type: "noun", Preposition: true });
                                    } else {
                                        ret.push({ Text: body + z, Number: 2, Fall: i + 1 - 7, Type: "noun", Preposition: false });
                                    }
                                }
                            }
                        } else if (pattern.Shapes[i] != "?") ret.push({ Text: body + pattern.Shapes[i], Number: 2, Fall: i - 7 + 1, Type: "noun" });
                    }
                    break;
                }
            }
        }

        //		if (ret.length!=0) console.log(ret);
        if (ret.length == 0) return null;
        else return { Shapes: ret, Gender: this.To.Gender, Object: this };
    }
}

class ItemSimpleWord {
    constructor() {
        this.input = null;
    }

    static Load(data) {
        let raw = LoadDataLineString(data,sSimpleWord).split('|');

        if (raw[0] == '') return null;
        let item = new ItemSimpleWord();

        // z
        if (raw[0].includes(',')) item.input = raw[0].split(',');
        else item.input = raw[0];

        item.show = raw[1] == "1";

        // na
        item.output = FastLoadTranslateTo(raw, 2);
        if (item.output == null) return null;
        return item;
    }
}

class ItemAdverb {
    constructor() {
        this.input = null;
    }

    static Load(data, shortcuts) {
        let raw = LoadDataLineString(data,shortcuts).split('|');

        if (raw[0] == '') return null;
        let item = new ItemAdverb();

        // z
        if (raw[0].includes(',')) item.input = raw[0].split(',');
        else item.input = raw[0];

        //item.show=raw[1]=="1";

        // na
        item.output = FastLoadTranslateTo(raw, 1);
        if (item.output == null) return null;
        return item;
    }
}

class ItemPhrase {
    constructor() {
        this.input = []; //[["k", "moři"], ["k", "mořu"]]
        this.output = []; //[["k", "mořu"], ["k", "mořu"]]
    }

    static Load(data) {
        let raw = LoadDataLineString(data,sPhrase).split('|');
     
        if (raw[0] == '') return null;
        let item = new ItemPhrase();
        item.input = this.DoubleSplitInp(raw[0]);
        item.show = raw[0] == "1";
        item.output = this.FastLoadTranslateTo(raw, 2);
        if (item.output == null) return null;
        return item;
    }

    static DoubleSplit(str) {
        // "k moři,k mořu" ->> [["k", " ", "moři"], ["k", " ", "mořu"]]
        let arr = [];
        for (const w of str.split(",")) {
            arr.push({ Text: this.MultipleSplit(w, " -") });
        }
        return arr;
    }

    static DoubleSplitInp(str) {
        // "k moři,k mořu" ->> [["k", " ", "moři"], ["k", " ", "mořu"]]
        let arr = [];
        for (const w of str.split(",")) {
            arr.push(this.MultipleSplit(w, " -"));
        }
        return arr;
    }

    static SplitSentences(string, separators) {
        let arr = [];
        let sentence = "";
        let isSeparator;

        for (const ch of string) {
            isSeparator = false;

            // Is current char separator
            for (const s of separators) {
                if (s == ch) {
                    isSeparator = true;
                    if (sentence != "") {
                        sentence += ch;
                        arr.push(sentence.trim());
                        sentence = "";
                    }
                    break;
                }
            }

            if (!isSeparator) {
                sentence += ch;
            }
        }
        if (!isSeparator) {
            if (sentence != "") arr.push(sentence.trim());
        }
        // for example [["true", "He"], [false, " "], [true, "is"], [false, " "], [true, "guy"], [false, "!"]]
        return arr;
    }

    static MultipleSplit(string, separators) {
        let arr = [];
        let word = "";
        let isSeparator;

        for (const ch of string) {
            isSeparator = false;
            //let separator;

            // Is current char separator
            for (const s of separators) {
                if (s == ch) {
                    isSeparator = true;
                    if (word != "") {
                        arr.push( /*[true, */ word /*]*/ );
                        word = "";
                    }
                    arr.push( /*[false, */ s /*]*/ );
                    break;
                }
            }

            if (!isSeparator) {
                word += ch;
            }
        }
        if (!isSeparator) {
            if (word != "") arr.push( /*[true, */ word /*]*/ );
        }
        // for example [["true", "He"], [false, " "], [true, "is"], [false, " "], [true, "guy"], [false, "!"]]
        return arr;
    }
  
    static FastLoadTranslateTo(rawData, indexStart) {
        let ret = [];
        for (let i = indexStart; i < rawData.length; i += 2) {
            let rawText = rawData[i];

            if (rawText == '') continue;
            if (rawText.includes('?')) continue;

            ret.push({ Text: this.MultipleSplit(rawText, " -"), Comment: rawData[i + 1] });
        }

        if (ret.length == 0) {
            if (dev) console.log("Cannot load pattern '" + rawData + "'");
            return null;
        }

        return ret;
    }
}

class ItemReplaceS {
    constructor() {
        this.input = "";
        this.output = "";
    }

    static Load(data) {
        let raw = LoadDataLineString(data,sReplaceS).split('|');
        if (raw[0] == '') return null;
        if (raw.length == 1) {
            let item = new ItemReplaceS();
            item.input = raw[0];
            item.output = raw[0];
            return item;
        }
        if (raw.length == 2) {
            let item = new ItemReplaceS();
            item.input = raw[0];
            item.output = raw[1];
            return item;
        }
        return null;
    }
}

class ItemReplaceG {
    constructor() {
        this.input = "";
        this.output = "";
    }

    static Load(data) {
        let raw = LoadDataLineString(data,sReplaceG).split('|');
        if (raw[0] == '') return null;
        if (raw.length == 1) {
            let item = new ItemReplaceG();
            item.input = raw[0];
            item.output = raw[0];
            return item;
        }
        if (raw.length == 2) {
            let item = new ItemReplaceG();
            item.input = raw[0];
            item.output = raw[1];
            return item;
        }
        return null;
    }
}

class ItemReplaceE {
    constructor() {
        this.input = "";
        this.output = "";
    }

    static Load(data) {
        let raw = LoadDataLineString(data,sReplaceE).split('|');
        if (raw[0] == '') return null;
        if (raw.length == 1) {
            let item = new ItemReplaceE();
            item.input = raw[0];
            item.output = raw[0];
            return item;
        }
        if (raw.length == 2) {
            let item = new ItemReplaceE();
            item.input = raw[0];
            if (raw[1].includes(',')) item.output = raw[1].split(",");
            else item.output = raw[1];
            return item;
        }
        return null;
    }
}

class ItemPreposition {
    constructor() {
        this.input = "";
        this.output = [];
        this.fall = [];
    }

    static Load(data) {
        let raw = LoadDataLineString(data,sPreposition).split('|');//console.log(raw);
        let item = new ItemPreposition();

        if (raw[0] == '' || raw.length<3) return null;
        item.input = raw[0].split(',');

        if (raw[1] != "") {
            console.log(raw[1]);
            for (const f of raw[1].split(',')) {
                let num = parseInt(f);
                if (!isNaN(num)) item.fall.push(num);
            }
        }
        item.output = FastLoadTranslateTo(raw, 2);
        if (item.output == null) return null;
        return item;
    }

    IsStringThisWord(str) {
        if (this.input == str) {
            if (this.input != "?") return [this.output, this.fall];
        }
        return null;
    }
}

class SentencePatternWordSubstitution {
    constructor() {
        this.id = -1;
        this.PartOfspeech = -1; // Podstatná jm., páádavná, ...
        this.Gender = -1;
        this.Fall = -1;
        this.GramaticalNumber = -1;

        this.GenderSameAsId = -1;
        this.FallSameAsId = -1;
        this.GramaticalNumberSameAsId = -1;
    }
}

class SentencePatternWordSubstitutionSimple {
    constructor() {
        this.PartOfspeech = -1; // Podstatná jm., páádavná, ...
        this.Gender = -1;
        this.Fall = -1;
        this.GramaticalNumber = -1;
    }
}

class ItemSentencePattern {
    constructor() {
        this.selectedIndex = 0;
        this.input = [];
        this.output = [];
    }

    static Load(data) {
        let raw = data.split('|');
        if (raw.length == 2) {

            let item = new ItemSentencePattern();
            // Input
            // from: Dal jsi to <id=1,3.pád,á.j.,rod muá.>, <id=2,4.pád,á j.,rod muá> <id=3,4.pád,á j.,rod muá>?"
            // from: Dal jsi to <1,13jM>, <id=2,4.pád,á j.,rod muá> <id=3,4.pád,á j.,rod muá>?"
            // to:   Dal jsi to |id=1,3.pád,á.j.,rod muá.|, |id=2,4.pád,á j.,rod muá| |id=3,4.pád,á j.,rod muá|?"
            let inputRawArray = raw[0].split(/<|>/);

            // Vzorec na zaáátku, nebo dál
            let n = 0;

            for (let i = 0; i < inputRawArray.length; i++) {

                if (i % 2 == n) {
                    // sudá (pokud nezaááná)==text
                    if (inputRawArray[i] != "") item.input.push(inputRawArray[i]);
                } else {
                    let rawRule = inputRawArray[i];
                    let pattern = this.LoadRules(rawRule);
                    if (pattern == null) return null;

                    item.input.push(pattern);
                }
            }

            let outputRawArray = raw[1].split(/<|>/);
            for (let i = 0; i < outputRawArray.length; i++) {
                if (i % 2 == 0) {
                    // sudá==text
                    if (outputRawArray[i] != "") item.output.push(outputRawArray[i]);
                } else {
                    let rawRule = inputRawArray[i];
                    let pattern = this.LoadRules(rawRule);
                    if (pattern == null) return null;

                    item.output.push(pattern);
                }
            }
            return item;
        } else if (raw.length == 1) {

            let item = new ItemSentencePattern();
            // Input
            // from: Dal jsi to <id=1,3.pád,á.j.,rod muá.>, <id=2,4.pád,á j.,rod muá> <id=3,4.pád,á j.,rod muá>?"
            // from: Dal jsi to <1,13jM>, <id=2,4.pád,á j.,rod muá> <id=3,4.pád,á j.,rod muá>?"
            // to:   Dal jsi to |id=1,3.pád,á.j.,rod muá.|, |id=2,4.pád,á j.,rod muá| |id=3,4.pád,á j.,rod muá|?"
            let inputRawArray = raw[0].split(/<|>/);

            // Vzorec na zaáátku, nebo dál
            let n = 0;

            for (let i = 0; i < inputRawArray.length; i++) {

                if (i % 2 == n) {
                    // sudá (pokud nezaááná)==text
                    if (inputRawArray[i] != "") item.input.push(inputRawArray[i]);
                } else {
                    let rawRule = inputRawArray[i];
                    let pattern = this.LoadRules(rawRule);
                    if (pattern == null) return null;

                    item.input.push(pattern);
                }
            }

            let outputRawArray = raw[0].split(/<|>/);
            for (let i = 0; i < outputRawArray.length; i++) {
                if (i % 2 == 0) {
                    // sudá==text
                    if (outputRawArray[i] != "") item.output.push(outputRawArray[i]);
                } else {
                    let rawRule = inputRawArray[i];
                    let pattern = this.LoadRules(rawRule);
                    if (pattern == null) return null;

                    item.output.push(pattern);
                }
            }
            return item;
        }
        return null;
    }

    static LoadRules(rawStr) {
        if (rawStr == undefined) return null;
        let pattern = new SentencePatternWordSubstitution();
        let rawRules = rawStr.split(",");

        for (const rawRule of rawRules) {

            if (rawRule == "pods") {
                pattern.PartOfspeech = 1;
                continue;
            }
            if (rawRule == "prid") {
                pattern.PartOfspeech = 2;
                continue;
            }
            if (rawRule == "zajm") {
                pattern.PartOfspeech = 3;
                continue;
            }
            if (rawRule == "cisl") {
                pattern.PartOfspeech = 4;
                continue;
            }
            if (rawRule == "slov") {
                pattern.PartOfspeech = 5;
                continue;
            }
            if (rawRule == "pris") {
                pattern.PartOfspeech = 6;
                continue;
            }
            if (rawRule == "pred") {
                pattern.PartOfspeech = 7;
                continue;
            }
            if (rawRule == "spoj") {
                pattern.PartOfspeech = 8;
                continue;
            }
            if (rawRule == "cast") {
                pattern.PartOfspeech = 9;
                continue;
            }
            if (rawRule == "cito") {
                pattern.PartOfspeech = 10;
                continue;
            }

            if (rawRule.includes("=")) {
                let rulerawparts = rawRule.split("=");
                let name = rulerawparts[0];
                let value = rulerawparts[1];

                if (name == "id") {
                    pattern.id = parseInt(value);
                    continue;
                }
                if (name == "pad" || name == "pád") {
                    if (value.includes("id")) {
                        pattern.FallSameAsId = parseInt(value.substring(2));
                        //	console.log(pattern.FallSameAsId,value,value.substring(2));
                        continue;
                    } else {
                        pattern.Fall = parseInt(value);
                        continue;
                    }
                }
                if (name == "c" || name == "č") {
                    if (value.includes("id")) {
                        pattern.GramaticalNumberSameAsId = parseInt(value.substring(2));
                        //	console.log(pattern.number,value,value.substring(2));
                        continue;
                    } else {
                        if (value == "j") {
                            pattern.Number = 1;
                            continue;
                        }
                        if (value == "m") {
                            pattern.Number = 2;
                            continue;
                        }
                        continue;
                    }
                }
                if (name == "rod") {
                    if (value.includes("id")) {
                        pattern.number = parseInt(value.substring(2));
                        //		console.log(pattern.number,value,value.substring(2));
                        continue;
                    } else {
                        if (value == "str" || value == "stř") {
                            pattern.Gender = "str";
                            continue;
                        }
                        if (value == "zen" || value == "žen") {
                            pattern.Gender = "zen";
                            continue;
                        }
                        if (value == "muz" || value == "muž") {
                            pattern.Gender = "muz";
                            continue;
                        }
                        if (value == "muz ziv" || value == "muž živ") {
                            pattern.Gender = "muz ziv";
                            continue;
                        }
                        if (value == "muz nez" || value == "muž než") {
                            pattern.Gender = "muz nez";
                            continue;
                        }
                    }
                }
            }
            if (dev) console.log("⚠️ Unknows rule in pattern '", rawRule, "' all rules:", rawRules);
            return null;
        }
        return pattern;
    }

    MultipleSplit(string) {
        // for example [["true", "...pattern..."], [false, " guy!"]]
        // true  = pattern
        // false = string
        let arr = [];
        let word = "";
        let isSeparator;

        for (const ch of string) {
            isSeparator = false;
            let separator;

            // Is current char separator
            if (xh == "<") {
                isSeparator = true;

                if (word != "") {
                    arr.push([ch == ">", word]);
                    word = "";
                }
                //arr.push([false, s]);
            } else if (ch == ">") {
                isSeparator = true;

                if (word != "") {
                    arr.push([ch == ">", word]);
                    word = "";
                }
                //arr.push([true, s]);
            } else if (!isSeparator) {
                word += ch;
            }
        }

        if (!isSeparator) {
            if (word != "") arr.push([false, word]);
        }

        return arr;
    }
}

class ItemSentencePatternPart {
    constructor() {
        this.selectedIndex = 0;
        this.input = [];
        this.output = [];
    }

    static Load(data) {
        let raw = data.split('|');
        if (raw.length == 2) {
            let item = new ItemSentencePatternPart();
            // Input
            // from: Dal jsi to <id=1,3.pád,á.j.,rod muá.>, <id=2,4.pád,á j.,rod muá> <id=3,4.pád,á j.,rod muá>?"
            // from: Dal jsi to <1,13jM>, <id=2,4.pád,á j.,rod muá> <id=3,4.pád,á j.,rod muá>?"
            // to:   Dal jsi to |id=1,3.pád,á.j.,rod muá.|, |id=2,4.pád,á j.,rod muá| |id=3,4.pád,á j.,rod muá|?"
            let inputRawArray = raw[0].split(/<|>/);

            // Vzorec na zaáátku, nebo dál
            let n = 0;
            //	if (raw[0].startsWith('<')) n=1;

            for (let i = 0; i < inputRawArray.length; i++) {

                if (i % 2 == n) {
                    // sudá (pokud nezaááná)==text
                    if (inputRawArray[i] != "") item.input.push(inputRawArray[i]);
                } else { //console.log(inputRawArray[i],inputRawArray,n);
                    // lichá=pravidlo
                    let rawRule = inputRawArray[i];
                    let pattern = this.LoadRules(rawRule);
                    if (pattern == null) return null;
                    //let rawRules=rawRule.split(',');

                    //let pattern=new SentencePatternWordSubstitution();
                    /*	pattern.id=parseInt(rawRules[0]);

                    	if (rawRules[1].length==4) {
                    		// Type
                    		let rawType=rawRules[1][0];
                    		if (rawType!='x') pattern.PartOfspeech=parseInt(rawType);

                    		// Fall
                    		let rawFall=rawRules[1][1];
                    		if (rawType!='x') pattern.Fall=parseInt(rawType);

                    		// Number
                    		let rawNumber=rawRules[1][2];
                    		if (rawType=="j") pattern.GramaticalNumber=1;
                    		else if (rawType=="m") pattern.GramaticalNumber=2;
                    		
                    		// Gender
                    		let rawGender=rawRules[1][3];
                    		if (rawType=="S") pattern.Gender="S";
                    		else if (rawType=="Z") pattern.Gender="Z";
                    		else if (rawType=="M") pattern.Gender="M";
                    		else if (rawType=="N") pattern.Gender="N";
                    	} else if (dev) console.log("Error not 4 char match");
                    	*/
                    item.input.push(pattern);
                }
            }

            let outputRawArray = raw[1].split(/<|>/);
            for (let i = 0; i < outputRawArray.length; i++) {
                if (i % 2 == 0) {
                    // sudá==text
                    if (outputRawArray[i] != "") item.output.push(outputRawArray[i]);
                } else {
                    // lichá=pravidlo
                    //	let rawRule=outputRawArray[i];

                    let rawRule = inputRawArray[i];
                    let pattern = this.LoadRules(rawRule);
                    if (pattern == null) return null;
                    /*
                    				let rawRules=rawRule.split(',');

                    				let pattern=new SentencePatternWordSubstitution();
                    				pattern.id=parseInt(rawRules[0]);

                    				if (rawRules[1].length==4) {
                    					// Type
                    					let rawType=rawRules[1][0];
                    					if (rawType!='x') pattern.PartOfspeech=parseInt(rawType);

                    					// Fall
                    					let rawFall=rawRules[1][1];
                    					if (rawType!='x') pattern.Fall=parseInt(rawType);

                    					// Number
                    					let rawNumber=rawRules[1][2];
                    					if (rawType=="j") pattern.GramaticalNumber=1;
                    					else if (rawType=="m") pattern.GramaticalNumber=2;
                    					
                    					// Gender
                    					let rawGender=rawRules[1][3];
                    					if (rawType=="S") pattern.Gender="S";
                    					else if (rawType=="Z") pattern.Gender="Z";
                    					else if (rawType=="M") pattern.Gender="M";
                    					else if (rawType=="N") pattern.Gender="N";
                    				} else if (dev) console.log("Error not 4 char match");*/

                    item.output.push(pattern);
                }
            }
            return item;
        }
    }

    static LoadRules(rawStr) {
        let pattern = new SentencePatternWordSubstitution();
        let rawRules = rawStr.split(",");

        for (const rawRule of rawRules) {

            if (rawRule == "pods") {
                pattern.PartOfspeech = 1;
                continue;
            }
            if (rawRule == "prid") {
                pattern.PartOfspeech = 2;
                continue;
            }
            if (rawRule == "zajm") {
                pattern.PartOfspeech = 3;
                continue;
            }
            if (rawRule == "cisl") {
                pattern.PartOfspeech = 4;
                continue;
            }
            if (rawRule == "slov") {
                pattern.PartOfspeech = 5;
                continue;
            }
            if (rawRule == "pris") {
                pattern.PartOfspeech = 6;
                continue;
            }
            if (rawRule == "pred") {
                pattern.PartOfspeech = 7;
                continue;
            }
            if (rawRule == "spoj") {
                pattern.PartOfspeech = 8;
                continue;
            }
            if (rawRule == "cast") {
                pattern.PartOfspeech = 9;
                continue;
            }
            if (rawRule == "cito") {
                pattern.PartOfspeech = 10;
                continue;
            }

            if (rawRule.includes("=")) {
                let rulerawparts = rawRule.split("=");
                let name = rulerawparts[0];
                let value = rulerawparts[1];

                if (name == "id") {
                    pattern.id = parseInt(value);
                    continue;
                }
                if (name == "pad" || name == "pád") {
                    if (value.includes("id")) {
                        pattern.FallSameAsId = parseInt(value.substring(2));
                        //	console.log(pattern.FallSameAsId,value,value.substring(2));
                        continue;
                    } else {
                        pattern.Fall = parseInt(value);
                        continue;
                    }
                }
                if (name == "c" || name == "č") {
                    if (value.includes("id")) {
                        pattern.GramaticalNumberSameAsId = parseInt(value.substring(2));
                        //	console.log(pattern.number,value,value.substring(2));
                        continue;
                    } else {
                        if (value == "j") {
                            pattern.Number = 1;
                            continue;
                        }
                        if (value == "m") {
                            pattern.Number = 2;
                            continue;
                        }
                        continue;
                    }
                }
                if (name == "rod") {
                    if (value.includes("id")) {
                        pattern.number = parseInt(value.substring(2));
                        //		console.log(pattern.number,value,value.substring(2));
                        continue;
                    } else {
                        if (value == "str" || value == "stř") {
                            pattern.Gender = "str";
                            continue;
                        }
                        if (value == "zen" || value == "žen") {
                            pattern.Gender = "zen";
                            continue;
                        }
                        if (value == "muz" || value == "muž") {
                            pattern.Gender = "muz";
                            continue;
                        }
                        if (value == "muz ziv" || value == "muž živ") {
                            pattern.Gender = "muz ziv";
                            continue;
                        }
                        if (value == "muz nez" || value == "muž než") {
                            pattern.Gender = "muz nez";
                            continue;
                        }
                    }
                }
            }
            if (dev) console.log("⚠️ Unknown rule in pattern '", rawRule, "' all rules:", rawRules);
            return null;
        }
        return pattern;
    }

    MultipleSplit(string) {
        // for example [["true", "...pattern..."], [false, " guy!"]]
        // true  = pattern
        // false = string
        let arr = [];
        let word = "";
        let isSeparator;

        for (const ch of string) {
            isSeparator = false;
            let separator;

            // Is current char separator
            if (xh == "<") {
                isSeparator = true;

                if (word != "") {
                    arr.push([ch == ">", word]);
                    word = "";
                }
                //arr.push([false, s]);
            } else if (ch == ">") {
                isSeparator = true;

                if (word != "") {
                    arr.push([ch == ">", word]);
                    word = "";
                }
                //arr.push([true, s]);
            } else if (!isSeparator) {
                word += ch;
            }
        }

        if (!isSeparator) {
            if (word != "") arr.push([false, word]);
        }

        return arr;
    }
}

class ItemPatternPronoun {
    constructor() {
        this.Name;
        this.Type;
        this.Shapes;
    }

    static Load(data,shortcuts) {
        let raw = LoadDataLinePattern(data,shortcuts).split('|');
  
        let shapesAll = LoadArr(raw, 14 * 4, 1)

        if (shapesAll.length == 14) {
            let item = new ItemPatternPronoun();
            item.Name = raw[0];
            item.Type = 1;
            item.Shapes = shapesAll;
            return item;
        }
        if (shapesAll.length == 7) {
            let item = new ItemPatternPronoun();
            item.Name = raw[0];
            item.Type = 2;
            item.Shapes = shapesAll;
            return item;
        }
        if (shapesAll.length == 1) {
            let item = new ItemPatternPronoun();
            item.Name = raw[0];
            item.Type = 3;
            item.Shapes = shapesAll;
            return item;
        }
        if (shapesAll.length == 14 * 4) {
            let item = new ItemPatternPronoun();
            item.Name = raw[0];
            item.Type = 4;
            item.Shapes = [14 * 4];
            item.Shapes = shapesAll;
            return item;
        }
        if (dev) console.log("⚠️ PatternPronoun - Chybná délka (" + raw.length + ")");
        return null;
    }
}

class ItemPronoun {
    //static pattensFrom=[];
    //static pattensTo=[];

    constructor() {
        this.From;
        this.To = [];
    }

    static Load(data) {
        let raw = data.split('|');

        let item = new ItemPronoun();
        item.From = raw[0];

        let paternFrom = this.GetPatternByNameFrom(raw[1]);
        if (paternFrom == null) {
            if (dev) console.log("Cannot load pattern '" + raw[1] + "'");
            return null;
        }
        item.PatternFrom = paternFrom;

        let to = FastLoadTranslateToWithPattern(raw, 2, this);
        if (to == null) {
            return null;
        }
        item.To = to;

        return item;
    }

    static GetPatternByNameFrom(name) {
        for (const p of ItemPronoun_pattensFrom) {
            if (p.Name == name) return p;
        }
    }

    static GetPatternByNameTo(name) {
        for (const p of ItemPronoun_pattensTo) {
            if (p.Name == name) return p;
        }
    }

    IsStringThisWordGetTo(from, to, str, number, fallOffset, gender) {
        let arr = [];
        for (let i = from; i < to; i++) {
            let patternShapesFrom = this.PatternFrom.Shapes[i];
            if (!Array.isArray(patternShapesFrom)) patternShapesFrom = [patternShapesFrom];

            for (const s of patternShapesFrom) {

                // "s"+"e" == "se"
                if (this.From + s == str) {
                    for (let t of this.To) {
                        let body = t.Body;
                        let patternShapesTo = t.Pattern.Shapes[i];
                        if (patternShapesTo == undefined) continue;
                        if (!Array.isArray(patternShapesTo)) patternShapesTo = [patternShapesTo];

                        for (let shapePatternTo of patternShapesTo) {
                            if (shapePatternTo != "?") {
                                //if (shapePatternTo==undefined)	console.log(shapePatternTo, t, i, t.Pattern.Shapes[i+fallOffset], gender, number, i+fallOffset);
                                if (shapePatternTo.startsWith("#")) {
                                    arr.push({ Text: body + shapePatternTo.substring(1), Number: number, Fall: i + 1 + fallOffset, Gender: gender, Preposition: true });
                                } else {
                                    arr.push({ Text: body + shapePatternTo, Number: number, Fall: i + 1 + fallOffset, Gender: gender, Preposition: false });
                                }
                            }
                        }
                    }
                    break;
                }
            }
        }
        //console.log(arr);
        return arr;
    }
    IsStringThisWordGetToNG(from, to, str, number, fallOffset) {
        let arr = [];
        for (let i = from; i < to; i++) {
            let patternShapesFrom = this.PatternFrom.Shapes[i];
            if (!Array.isArray(patternShapesFrom)) patternShapesFrom = [shapesFrom];

            for (const s of patternShapesFrom) {

                // "s"+"e" == "se"
                if (this.From + s == str) {
                    for (let t of this.To) {
                        let body = t.Body;
                        let patternShapesTo = t.Pattern.Shapes[i];
                        if (patternShapesTo == undefined) continue;
                        if (!Array.isArray(patternShapesTo)) patternShapesTo = [patternShapesTo];

                        for (let shapePatternTo of patternShapesTo) {
                            if (shapePatternTo != "?") {
                                if (shapePatternTo.startsWith("#")) {
                                    arr.push({ Text: body + shapePatternTo.substring(1), Number: number, Fall: i + 1 + fallOffset, Preposition: true });
                                } else {
                                    arr.push({ Text: body + shapePatternTo, Number: number, Fall: i + 1 + fallOffset, Preposition: false });
                                }
                            }
                        }
                    }
                    break;
                }
            }
        }
        //	console.log(arr);
        return arr;
    }

    IsStringThisWord(str) {
        // Return all possible falls with numbers
        // [[tvar, číslo, pád], rod]
        //	console.log(str);
        if (!str.startsWith(this.From)) return null;
        //		console.log(this);

        let ret = [];
        if (this.PatternFrom.Shapes.length == 14 * 4) {
            {
                let forms1 = this.IsStringThisWordGetTo(0, 7, str, 1, 0, "mz");
                if (forms1.length > 0) ret.push(...forms1);
                let forms2 = this.IsStringThisWordGetTo(7, 14, str, 2, -7, "mn");
                if (forms2.length > 0) ret.push(...forms2);
            } {
                let forms1 = this.IsStringThisWordGetTo(14, 21, str, 1, -14, "mn");
                if (forms1.length > 0) ret.push(...forms1);
                let forms2 = this.IsStringThisWordGetTo(21, 28, str, 2, -21, "mn");
                if (forms2.length > 0) ret.push(...forms2);
            } {
                let forms1 = this.IsStringThisWordGetTo(28, 35, str, 1, -28, "z");
                if (forms1.length > 0) ret.push(...forms1);
                let forms2 = this.IsStringThisWordGetTo(35, 42, str, 2, -35, "z");
                if (forms2.length > 0) ret.push(...forms2);
            } {
                let forms1 = this.IsStringThisWordGetTo(42, 49, str, 1, -42, "s");
                if (forms1.length > 0) ret.push(...forms1);
                let forms2 = this.IsStringThisWordGetTo(49, 56, str, 2, -49, "s");
                if (forms2.length > 0) ret.push(...forms2);
            }

            /*for (let i=0; i<7; i++) {
            	let shapes=this.PatternFrom.Shapes[i];
            	
            	for (const s of shapes) {
            		if (this.From+s==str) {
            			//let arr=[];
            			for (let t of this.To) {
            				let body=t.Body;
            				let pattern=t.Pattern.Shapes[i];
            				if (Array.isArray(pattern)){
            					for (let shapePatternTo of pattern) {
            						if (s!="?") ret.push({Text: body+shapePatternTo, Number: 1, Fall: i+1, Gender: "muz"});
            					}
            				}else if (s!="?") ret.push({Text: body+pattern, Number: 1, Fall: i+1, Gender: "muz"});
            			}
            			break;
            		}
            	}
            }
            for (let i=7; i<14; i++) {
            	let shapes=this.PatternFrom.Shapes[i];

            	for (let j=0; j<shapes.length; j++) {
            		let shape=this.From+shapes[j];

            		if (shape==str) {
            			//let arr=[];
            			for (let t of this.To) {
            				let body=t.Body;
            				let pattern=t.Pattern.Shapes[i];
            				if (s!="?") ret.push({Text: body+pattern, Number: 2, Fall: i-7+1, Gender: "muz"});
            			}
            			//if (arr.length>0) ret.push({Text: arr, Number: 2, Fall: i-7+1, Gender: "muz"});
            			break;
            		}
            	}
            }

            for (let i=14; i<21; i++) {
            	let shapes=this.PatternFrom.Shapes[i];
            	
            	for (let j=0; j<shapes.length; j++) {
            		let shape=this.From+shapes[j];
            		//console.log(this.From+shapes[j]);
            		if (shape==str) {
            			//let arr=[];
            			for (let t of this.To) {
            				let body=t.Body;
            				let pattern=t.Pattern.Shapes[i];
            				if (pattern!="?") arr.push({Text: body+pattern});
            			}
            			//if (arr.length>0) ret.push({Text: arr, 1, i+1-14,"mun"});
            			break;
            		}
            	}
            }
            for (let i=21; i<28; i++) {
            	let shapes=this.PatternFrom.Shapes[i];

            	for (let j=0; j<shapes.length; j++) {
            		let shape=this.From+shapes[j];

            		if (shape==str) {
            			//let arr=[];
            			for (let t of this.To) {
            				let body=t.Body;
            				let pattern=t.Pattern.Shapes[i];
            				if (pattern!="?")  arr.push({Text: body+pattern});
            			}
            			//if (arr.length>0) ret.push({Text: arr, Number: 2, Fall: i-7-14+1, Gender: "mun"});
            			break;
            		}
            	}
            }

            for (let i=28; i<35; i++) {
            	let shapes=this.PatternFrom.Shapes[i];
            	
            	for (let j=0; j<shapes.length; j++) {
            		let shape=this.From+shapes[j];
            		//console.log(this.From+shapes[j]);
            		if (shape==str) {
            		//	let arr=[];
            			for (let t of this.To) {
            				let body=t.Body;
            				let pattern=t.Pattern.Shapes[i];
            				if (pattern!="?") arr.push({Text: body+pattern});
            			}
            		//	if (arr.length>0) ret.push({Text: arr, Number: 1, Fall: i+1-14-14, Gender: "zen"});
            			break;
            		}
            	}
            }
            for (let i=35; i<28+14; i++) {
            	let shapes=this.PatternFrom.Shapes[i];

            	for (let j=0; j<shapes.length; j++) {
            		let shape=this.From+shapes[j];

            		if (shape==str) {
            			//let arr=[];
            			for (let t of this.To) {
            				let body=t.Body;
            				let pattern=t.Pattern.Shapes[i];
            				if (pattern!="?") arr.push({Text: body+pattern, Number: 2, Fall: i-7-14-14+1, Gender: "zen"});
            			}
            		//	if (arr.length>0)  ret.push({Text: arr, Number: 2, Fall: i-7-14-14+1, Gender: "zen"});
            			break;
            		}
            	}
            }

            for (let i=14+14+14; i<21+14+14; i++) {
            	let shape=this.PatternFrom.Shapes[i];
            	
            	for (const s of shape) {
            		if (this.From+s==str) {
            			//let arr=[];
            			for (let t of this.To) {
            				let body=t.Body;
            				let pattern=t.Pattern.Shapes[i];
            				if (pattern!="?")  arr.push({Text: body+pattern, Number: 1, Fall: i+1-14-14-14, Gender: "str"});
            			}
            			//if (arr.length>0) ret.push({Text: arr, Number: 1, Fall: i+1-14-14-14, Gender: "str"});
            			break;
            		}
            	}
            }
            for (let i=21+14+14; i<28+14+14; i++) {
            	let shapes=this.PatternFrom.Shapes[i];

            	for (let j=0; j<shapes.length; j++) {
            		let shape=this.From+shapes[j];

            		if (shape==str) {
            			//let arr=[];
            			for (let t of this.To) {
            				let body=t.Body;
            				let pattern=t.Pattern.Shapes[i];
            				if (pattern!="?") arr.push({Text: body+pattern, Number: 1, Fall: i+1-14-14-14, Gender: "str"});
            			}
            		//	if (arr.length>0) ret.push({Text: arr, Number: 2, Fall: i-7-14+1-14-14, Gender: "str"});
            			break;
            		}
            	}
            }*/

            if (ret.length == 0) return null;
            else return { Shapes: ret, Object: this };
        } else if (this.PatternFrom.Shapes.length == 14) {
            {
                let forms1 = this.IsStringThisWordGetToNG(0, 7, str, 1, 0);
                if (forms1.length > 0) ret.push(...forms1);
                let forms2 = this.IsStringThisWordGetToNG(7, 14, str, 2, -7);
                if (forms2.length > 0) ret.push(...forms2);
            }

            /*for (let i=0; i<7; i++) {
				let shapes=this.PatternFrom.Shapes[i];
				
				for (let j=0; j<shapes.length; j++) {
					let shape=this.From+shapes[j];
//					console.log(this.From+shapes[j]);
					if (shape==str) {
						let arr=[];
						for (let t of this.To) {
							let body=t.Body;
							let pattern=t.Pattern.Shapes[i];
							if (Array.isArray(pattern)) {
								let sameShapes=[];
								for (let patternShape in pattern) {					
									if (patternShape!="?") sameShapes.push({Text: body+pattern, Number: 1, Fall: i+1});
								}
								//arr.push(sameShapes);
							}else{
								arr.push({Text: body+pattern, Number: 1, Fall: i+1});
							}
						}
						//if (arr.length>0) ret.push([arr, 1, i+1]);
						break;
					}
				}
			}
			for (let i=7; i<14; i++) {
				let shapes=this.PatternFrom.Shapes[i];

				for (let j=0; j<shapes.length; j++) {
					let shape=this.From+shapes[j];

					if (shape==str) {
						let arr=[];
						for (let t of this.To) {
							let body=t.Body;
							let pattern=t.Pattern.Shapes[i];
							if (Array.isArray(pattern)) {
							//	let sameShapes=[];
								for (let patternShape in pattern) {
									if (patternShape!="?") ret.push({Text: body+pattern, Number: 2, Fall: i-7+1});
								}
								//arr.push(sameShapes);
							}else{
								if (pattern!="?") arr.push({text: body+pattern,  Number: 2, Fall: i-7+1});
							}	
						}
					//	if (arr.length>0) ret.push({arr, 2, i-7+1]);
						break;
					}
				}
			}*/

            if (ret.length == 0) return null;
            else return { Text: ret, Object: this, Type: "pron" };

        } else if (this.PatternFrom.Shapes.length == 7) {
            /*
            for (let i=0; i<7; i++) {
            	let shapes=this.PatternFrom.Shapes[i];
            	
            	if (Array.isArray(shapes)) {
            		for (let patternShape of shapes) {
            			let shape=this.From+patternShape;
            			
            			if (shape==str) {
            				for (let t of this.To) {
            				//	let arr=[];
            					console.log(t);
            					let body=t.Body;
            					if (Array.isArray(t.Pattern.Shapes[i])) {
            						for (let patternShapeTo in t.Pattern.Shapes[i]){
            							if (patternShapeTo!="?") ret.push({Text: body+patternShapeTo, Fall: i+1});
            						}
            					}else{
            						if (t.Pattern.Shapes[i]!="?") ret.push({Text: body+t.Pattern.Shapes[i], Fall: i+1});
            					}
            				//	if (arr.length>0) ret.push([arr, -1, i+1]);
            				}
            				break;
            			}
            		}
            	} else {
            		let shape=this.From+shapes;
            		
            		if (shape==str) {

            			for (let t of this.To) {
            			//	let arr=[];
            				console.log(t);
            				let body=t.Body;
            				if (Array.isArray(t.Pattern.Shapes[i])) {
            					for (let patternShapeTo in t.Pattern.Shapes[i]){
            						if (patternShapeTo!="?") ret.push({Text: body+patternShapeTo, Fall: i+1});
            					}
            				}else{
            					if (t.Pattern.Shapes[i]!="?") ret.push({Text: body+t.Pattern.Shapes[i], Fall: i+1});
            				}
            			//	if (arr.length>0) ret.push([arr, -1, i+1]);
            			}
            			break;
            		}
            	}
            }*/
            for (let i = 0; i < 7; i++) {
                let patternShapesFrom = this.PatternFrom.Shapes[i];
                if (!Array.isArray(patternShapesFrom)) patternShapesFrom = [patternShapesFrom];

                for (const s of patternShapesFrom) {
                    if (this.From + s == str) {
                        for (let t of this.To) {
                            let body = t.Body;
                            let patternShapesTo = t.Pattern.Shapes[i];
                            if (!Array.isArray(patternShapesTo)) patternShapesTo = [patternShapesTo];

                            for (let shapePatternTo of patternShapesTo) {
                                if (shapePatternTo != "?") {
                                    if (shapePatternTo.startsWith("#")) {
                                        ret.push({ Text: body + shapePatternTo.substring(1), Fall: i + 1, Preposition: true });
                                    } else {
                                        ret.push({ Text: body + shapePatternTo, Fall: i + 1, Preposition: false });
                                    }
                                }
                            }
                        }
                        break;
                    }
                }
            }

            //console.log(ret);
            if (ret.length == 0) return null;
            else return { Shapes: ret, Object: this, Type: "pron" };

        } else if (this.PatternFrom.Shapes.length == 1) {
            let shapes = this.PatternFrom.Shapes[0];

            let shape = this.From + shapes[0];
            if (shape == str) {
                let arr = [];
                let body = t.Body;
                for (let patternShape in t.Pattern.Shapes[i]) {
                    if (patternShape != "?") arr.push({ Text: body + patternShape });
                }
            }

            if (ret.length == 0) return null;
            else return { Shapes: ret, Object: this, Type: "pron" };
        }

        return null;
    }

    GetTable() {
        return this.PatternTo.GetTable(this.To);
    }
}

class ItemPatternAdjective {
    constructor() {
        this.Name;
        this.adjectiveType;
        this.Middle = [];
        this.Feminine = [];
        this.MasculineAnimate = [];
        this.MasculineInanimate = [];
    }


    static Load(data,shortcuts) {
        let raw = /*data*/LoadDataLinePattern(data,shortcuts).split('|');
        let item = new ItemPatternAdjective();
        item.Name = raw[0];
        item.adjectiveType = parseInt(raw[1]);

        let rawArr = LoadArr(raw, 18 * 4, 2)
        let pos = 0;
        item.Middle = GetArray();
        item.Feminine = GetArray();
        item.MasculineAnimate = GetArray();
        item.MasculineInanimate = GetArray();

        if (rawArr.length != 18 * 4) {
            if (dev) console.warn("PatternPronoun - Chybná délka", rawArr);
            return null;
        }
        return item;

        function GetArray() {
            let arr = [];
            let len = 18;
            for (let i = 0; i < len; i++) {
                arr.push(rawArr[i + pos]);
            }
            pos += len;
            return arr;
        }
    }
}

class ItemAdjective {
    //static pattensFrom;
    //static pattensTo;

    constructor() {
        this.From;
        //this.To;
        this.PatternFrom;
        //	this.PatternTo;
        this.To = [];
    }

    static Load(data) {
        let raw = data.split('|');
       /* if (loadedversion == "TW v0.1" || loadedversion == "TW v1.0") {
            if (raw.length == 4) {
                let paternFrom = this.GetPatternByNameFrom(raw[2]);
                if (paternFrom == null) {
                    if (dev) console.log("Cannot load pattern '" + raw[2] + "'");
                    return null;
                }

                let paternTo = this.GetPatternByNameTo(raw[3]);
                if (paternTo == null) {
                    if (dev) console.log("Cannot load pattern '" + raw[3] + "'");
                    return null;
                }

                let item = new ItemAdjective();
                item.From = raw[0];
                item.To = [{ Body: raw[1], Pattern: paternTo }];
                item.PatternFrom = paternFrom;
                //item.PatternTo=paternTo;
                return item;
            } else if (raw.length == 3) {
                let paternFrom = this.GetPatternByNameFrom(raw[1]);
                if (paternFrom == null) {
                    if (dev) console.log("Cannot load pattern '" + raw[1] + "'");
                    return null;
                }

                let paternTo = this.GetPatternByNameTo(raw[2]);
                if (paternTo == null) {
                    if (dev) console.log("Cannot load pattern '" + raw[2] + "'");
                    return null;
                }

                let item = new ItemAdjective();
                item.From = raw[0];
                item.To = [{ Body: raw[0], Pattern: paternTo }];
                item.PatternFrom = paternFrom;
                //item.PatternTo=paternTo;
                return item;
            }
            if (dev) console.log("Cannot load pattern, wrong len");
            return null;
        } else if (loadedVersionNumber >= 2) {*/
            let item = new ItemAdjective();
            item.From = raw[0];

            let paternFrom = this.GetPatternByNameFrom(raw[1]);
            if (paternFrom == null) {
                if (dev) console.log("Cannot load pattern '" + raw[1] + "'");
                return null;
            }
            item.PatternFrom = paternFrom;

            item.To = FastLoadTranslateToWithPattern(raw, 2, this);
            if (item.To == null) return null;

            return item;
       // }
    }

    IsStringThisWord(str) {
        let ret = [];

        if (str.startsWith(this.From)) {

            function IsStringThisWordG(obj, start, end, gender) {

                for (let i = start; i < end; i++) {
                    //	console.log(obj.PatternFrom);
                    let shapes = obj.PatternFrom[gender][i];

                    if (!Array.isArray(shapes)) shapes = [shapes];

                    for (let j = 0; j < shapes.length; j++) {
                        let shape = shapes[j];

                        if (obj.From + shape == str) {
                            //console.log(obj.From+shape);

                            //	console.log(obj.To);
                            for (let to of obj.To) {
                                let shapesTo = to.Pattern[gender][i];
                                if (!Array.isArray(shapesTo)) shapesTo = [shapesTo];

                                for (let shapeTo of shapesTo) {
                                    if (shapeTo != "?") ret.push({ Text: to.Body + shapeTo, Number: start == 0 ? 1 : 2, Fall: i + 1 - start, Gender: gender });
                                }
                            }
                            break;
                        }
                    }
                }
            }

            IsStringThisWordG(this, 0, 7, "Feminine");
            IsStringThisWordG(this, 7, 14, "Feminine");

            IsStringThisWordG(this, 0, 7, "MasculineAnimate");
            IsStringThisWordG(this, 7, 14, "MasculineAnimate");

            IsStringThisWordG(this, 0, 7, "MasculineInanimate");
            IsStringThisWordG(this, 7, 14, "MasculineInanimate");

            IsStringThisWordG(this, 0, 7, "Middle");
            IsStringThisWordG(this, 7, 14, "Middle");


            // Return all possible falls with numbers
            // [[tvar, číslo, pád], rod]
            /*if (this.From=="") {
            	
            	for (let i=0; i<7; i++) {
            		let shape=this.PatternFrom.Feminine[i];

            	//	for (let j=0; j<shapes.length; j++) {
            			//let shape=shapes[j];
            		//	console.log(shape);

            			if (shape==str) {
            				//ret.push(this.To+this.PatternTo.Shapes[i]);	
            				for (let to of this.To) {
            					if (to.Pattern.Feminine[i]!="?") ret.push({Text: to.Body+to.Pattern.Feminine[i], Number: 1, Fall: i+1, Gender: "Feminine"}); // [tvar, rod, číslo, pád]	
            				}
            				break;	
            			}
            	//	}
            	}

            	for (let i=7; i<14; i++) {
            		let shape=this.PatternFrom.Feminine[i];

            	//	for (let j=0; j<shapes.length; j++) {
            			//let shape=shapes[j];
            		//	console.log(shape);

            			if (shape==str) {
            				//ret.push(this.To+this.PatternTo.Shapes[i]);
            				for (let to of this.To) {
            					if (to.Feminine[i]!="?") ret.push({Text: to.Body+to.Pattern.Feminine[i], Number: 2, Fall: i-7+1, Gender: "Feminine"});
            				}
            				break;
            			}
            		//}
            	}

            	for (let i=0; i<7; i++) {
            		let shape=this.PatternFrom.MasculineAnimate[i];

            	//	for (let j=0; j<shapes.length; j++) {
            		//	let shape=shapes[j];
            		//	console.log(shape);

            			if (shape==str) {
            				//ret.push(this.To+this.PatternTo.Shapes[i]);	
            				for (let to of this.To) {
            					if (to.MasculineAnimate[i]!="?") ret.push({Text: to.Body+to.Pattern.MasculineAnimate[i], Number: 1, Fall: i+1, "MasculineAnimate"}); // [tvar, rod, číslo, pád]	
            				}
            				break;	
            			}
            		//}
            	}

            	for (let i=7; i<14; i++) {
            		let shape=this.PatternFrom.MasculineAnimate[i];

            		//for (let j=0; j<shapes.length; j++) {
            		//	let shape=shapes[j];
            			//console.log(shape);

            			if (shape==str) {
            				//ret.push(this.To+this.PatternTo.Shapes[i]);
            				for (let to of this.To) {
            					if (to.MasculineAnimate[i]!="?") ret.push([to+to.Pattern.MasculineAnimate[i], 2, i-7+1, "MasculineAnimate"]);
            				}
            				break;
            			}
            	//	}
            	}

            	if (ret.length==0) return null; else return ret;
            } else {
            	if (str.startsWith(this.From)) {
            		let ret=[];

            		for (let i=0; i<7; i++) {
            			let shape=this.From+this.PatternFrom.Feminine[i];
            			
            		//	for (let j=0; j<shapes.length; j++) {
            			//	let shape=this.From+shapes[j];
            				//console.log("Feminine", shape);
            				
            				if (shape==str) {
            				//	console.log(this.PatternTo);
            					//ret.push(this.To+this.PatternTo.Shapes[i]);
            					for (let to of this.To) {
            						if (this.PatternTo.Feminine[i]!="?") {
            						 	ret.push([to.Body+to.Pattern.Feminine[i], 1, i+1, "Feminine"]);
            						}
            						break;
            					}
            				}
            		//	}
            		}

            		for (let i=7; i<14; i++) {
            			let shape=this.From+this.PatternFrom.Feminine[i];

            			//for (let j=0; j<shapes.length; j++) {
            				//let shape=this.From+shapes[j];
            				//console.log("Feminine", shape);
            			//	console.log(this.PatternTo.Feminine);
            				if (shape==str) {
            					//ret.push(this.To+this.PatternTo.Shapes[i]);
            					for (let to of this.To) {
            						if (to.Pattern.Feminine[i]!="?") ret.push([to.Body+to.Pattern.Feminine[i], 2, i-7+1, "Feminine"]);
            					}
            					break;
            				}
            			//}
            		}

            		for (let i=0; i<7; i++) {
            			let shape=this.From+this.PatternFrom.MasculineAnimate[i];
            			
            		//	for (let j=0; j<shapes.length; j++) {
            			//	let shape=this.From+shapes[j];
            			//	console.log(this.To);
            				
            				if (shape==str) {
            					//ret.push(this.To+this.PatternTo.Shapes[i]);
            					for (let to of this.To) {
            						if (to.Pattern.MasculineAnimate[i]!="?") ret.push([to.Body+to.Pattern.MasculineAnimate[i], 1, i+1, "MasculineAnimate"]);
            					}
            					break;
            				}
            			//}
            		}

            		for (let i=7; i<14; i++) {
            			let shape=this.From+this.PatternFrom.MasculineAnimate[i];

            			//for (let j=0; j<shapes.length; j++) {
            			//	let shape=this.From+shapes[j];
            				//console.log("MasculineAnimate",shape);

            				if (shape==str) {
            					//ret.push(this.To+this.PatternTo.Shapes[i]);
            					for (let to of this.To) {
            						if (to.Pattern.MasculineAnimate[i]!="?") ret.push([to.Body+to.Pattern.MasculineAnimate[i], 2, i-7+1, "MasculineAnimate"]);
            					}
            					break;
            				}
            		//	}
            		}

            		for (let i=0; i<7; i++) {
            			let shape=this.From+this.PatternFrom.MasculineInanimate[i];
            			
            		//	for (let j=0; j<shapes.length; j++) {
            			//	let shape=this.From+shapes[j];
            			//	console.log(shape);
            				
            				if (shape==str) {
            					//ret.push(this.To+this.PatternTo.Shapes[i]);
            					for (let to of this.To) {
            						if (to.Pattern.MasculineInanimate[i]!="?") ret.push([to+to.Pattern.MasculineInanimate[i], 1, i+1, "MasculineInanimate"]);
            					}
            					break;
            				}
            		//}
            		}

            		for (let i=7; i<14; i++) {
            			let shape=this.From+this.PatternFrom.MasculineInanimate[i];

            		//	for (let j=0; j<shapes.length; j++) {
            			//	let shape=this.From+shapes[j];
            			//	console.log(shape);

            				if (shape==str) {
            					//ret.push(this.To+this.PatternTo.Shapes[i]);
            					for (let to of this.To) {
            						if (to.Pattern.MasculineInanimate[i]!="?") ret.push([to.Body+to.Pattern.MasculineInanimate[i], 2, i-7+1, "MasculineInanimate"]);
            					}
            					break;
            				}
            			//}
            		}

            		for (let i=0; i<7; i++) {
            			let shape=this.From+this.PatternFrom.Middle[i];
            			
            		//	for (let j=0; j<shapes.length; j++) {
            			//	let shape=this.From+shapes[j];
            			//	console.log(shape);
            				
            				if (shape==str) {
            					//ret.push(this.To+this.PatternTo.Shapes[i]);
            					for (let to of this.To) {
            						if (to.Pattern.Middle[i]!="?") ret.push([to.Body+to.Pattern.Middle[i], 1, i+1, "Middle"]);
            					}
            					break;
            				}
            		//}
            		}

            		for (let i=7; i<14; i++) {
            			let shape=this.From+this.PatternFrom.Middle[i];

            		//	for (let j=0; j<shapes.length; j++) {
            			//	let shape=this.From+shapes[j];
            			//	console.log(shape);

            				if (shape==str) {
            					//ret.push(this.To+this.PatternTo.Shapes[i]);
            					for (let to of this.To) {
            						if (to.Pattern.Middle[i]!="?") ret.push([to.Body+to.Pattern.Middle[i], 2, i-7+1, "Middle"]);
            					}
            					break;
            				}
            			//}
            		}*/
            if (ret.length == 0) return null;
            else return ret;
            //	} else {
            //		return null;
            //	}
        }
        return null;
    }

    static GetPatternByNameFrom(name) {
        for (const p of ItemAdjective_pattensFrom) {
            if (p.Name == name) return p;
        }
        return null;
    }

    static GetPatternByNameTo(name) {
        for (const p of ItemAdjective_pattensTo) {
            if (p.Name == name) return p;
        }
        return null;
    }
  
    GetTable() {
        return this.PatternTo.GetTable(this.To);
    }
}

class ItemPatternNumber {
    constructor() {
        this.Name;
        this.Shapes = [];
    }

    static Load(data,shortcuts) {
        let raw = /*data*/LoadDataLinePattern(data,shortcuts).split('|');

        let item = new ItemPatternNumber();
        item.Name = raw[0];

        item.Shapes = LoadArr(raw, 14 * 4, 2);

        return item;
    }
}

class ItemNumber {
    //    static PatternFrom = [];
    //static PatternTo = [];

    constructor() {
        this.From;
        this.PatternFrom;
        this.To = [];
    }

    static Load(data) {
        let raw = data.split('|');
      /*  if (loadedversion == "TW v0.1" || loadedversion == "TW v1.0") {
            if (raw.length == 4) {
                let item = new ItemNumber();
                item.From = raw[0];
                //item.To=raw[1];

                let paternFrom = this.GetPatternByNameFrom(raw[2]);
                if (paternFrom == null) return null;
                else item.PatternFrom = paternFrom;

                let paternTo = this.GetPatternByNameTo(raw[3]);
                if (paternTo == null) return null;

                item.To = [{ Body: raw[1], Pattern: paternTo }];

                return item;
            }
        } else if (loadedVersionNumber >= 2) {*/
            let item = new ItemNumber();
            item.From = raw[0];

            let paternFrom = this.GetPatternByNameFrom(raw[1]);
            if (paternFrom == null) {
                if (dev) console.log("Cannot load pattern '" + raw[1] + "'");
                return null;
            }
            item.PatternFrom = paternFrom;

            item.To = FastLoadTranslateToWithPattern(raw, 2, this);
            if (item.To == null) {
                if (dev) console.log("Cannot load pattern '" + raw[1] + "'");
                return null;
            }
            return item;
       // }
        //return null;
    }

    static GetPatternByNameFrom(name) {
        for (const p of ItemNumber_pattensFrom) {
            if (p.Name == name) return p;
        }
    }

    static GetPatternByNameTo(name) {
        for (const p of ItemNumber_pattensTo) {
            if (p.Name == name) return p;
        }
    }

    IsStringThisWordG(str, startIndex, endIndex, number, gender) {
        let arr = [];
        for (let i = startIndex; i < endIndex; i++) {
            let shape = this.PatternFrom.Shapes[i];

            if (Array.isArray(shape)) {
                for (const s of shape) {
                    if (this.From + s == str) {
                        for (let to of this.To) {
                            if (to.Body != "?") {
                                for (let shapeTo of to.Pattern.Shapes[i]) {
                                    if (shapeTo != "?") arr.push({ Text: to.Body + shapeTo, Number: number, Fall: i + 1 - startIndex, Gender: gender });
                                }
                            }
                        }
                        break;
                    }
                }
            } else {
                if (this.From + shape == str) {
                    for (let to of this.To) {
                        if (to.Body != "?") {
                            for (let shapeTo of to.Pattern.Shapes[i]) {
                                if (shapeTo != "?") arr.push({ Text: to + shapeTo, Number: number, Fall: i + 1 - startIndex, Gender: gender });
                            }
                        }
                    }
                    break;
                }
            }
        }
        return arr;
    }

    IsStringThisWord(str) {
        //	if (this.PatternTo==null) return;
        if (this.PatternFrom == null) return;

        // Return all possible falls with numbers
        // [[tvar, číslo, pád], rod]
        let ret = [];
        if (!str.startsWith(this.From)) return;

        if (this.PatternFrom.Shapes.length == 14 * 4) {
            {
                let s1 = this.IsStringThisWordG(str, 0, 7, 1, "muz");
                if (s1.length > 0) ret.push(...s1);
                let s2 = this.IsStringThisWordG(str, 7, 14, 2, "muz");
                if (s2.length > 0) ret.push(...s2);
            } {
                let s1 = this.IsStringThisWordG(str, 0 + 14, 7 + 14, 1, "mun");
                if (s1.length > 0) ret.push(...s1);
                let s2 = this.IsStringThisWordG(str, 7 + 14, 14 + 14, 2, "mun");
                if (s2.length > 0) ret.push(...s2);
            } {
                let s1 = this.IsStringThisWordG(str, 0 + 28, 7 + 28, 1, "zen");
                if (s1.length > 0) ret.push(...s1);
                let s2 = this.IsStringThisWordG(str, 7 + 28, 14 + 28, 2, "zen");
                if (s2.length > 0) ret.push(...s2);
            } {
                let s1 = this.IsStringThisWordG(str, 0 + 42, 7 + 42, 1, "str");
                if (s1.length > 0) ret.push(...s1);
                let s2 = this.IsStringThisWordG(str, 7 + 42, 14 + 42, 2, "str");
                if (s2.length > 0) ret.push(...s2);
            }
        } else if (this.PatternFrom.Shapes.length == 14) {
            {
                let s1 = this.IsStringThisWordG(str, 0, 7, 1, undefined);
                if (s1.length > 0) ret.push(...s1);
                let s2 = this.IsStringThisWordG(str, 7, 14, 2, undefined);
                if (s2.length > 0) ret.push(...s2);
            }
        } else if (this.PatternFrom.Shapes.length == 7) {
            for (let i = 0; i < 7; i++) {
                let shape = this.PatternFrom.Shapes[i];

                if (Array.isArray(shape)) {
                    for (const s of shape) {
                        if (this.From + s == str) {
                            for (let to of this.To) {
                                console.log(to);
                                if (to.Body != "?") {
                                    if (Array.isArray(to.Pattern.Shapes[i])) {
                                        for (let shapeTo of to.Pattern.Shapes[i]) {
                                            if (shapeTo != "?") ret.push({ Text: to.Body + shapeTo, Fall: i + 1 });
                                        }
                                    } else {
                                        let shapeTo = to.Pattern.Shapes[i];
                                        if (shapeTo != "?") ret.push({ Text: to.Body + shapeTo, Fall: i + 1 });
                                    }
                                }
                            }
                            break;
                        }
                    }
                } else {
                    if (this.From + shape == str) {
                        for (let to of this.To) {
                            if (to.Body != "?") {
                                if (Array.isArray(to.Pattern.Shapes[i])) {
                                    for (let shapeTo of to.Pattern.Shapes[i]) {
                                        if (shapeTo != "?") ret.push({ Text: to.Body + shapeTo, Fall: i + 1 });
                                    }
                                } else {
                                    let shapeTo = to.Pattern.Shapes[i];
                                    if (shapeTo != "?") ret.push({ Text: to.Body + shapeTo, Fall: i + 1 });
                                }
                            }
                        }
                        break;
                    }
                }
            }
        } else if (this.PatternFrom.Shapes.length == 1) {
            let shape = this.PatternFrom.Shapes[0];

            if (Array.isArray(shape)) {
                for (const s of shape) {
                    if (this.From + s == str) {
                        for (let to of this.To) {
                            if (to.Body != "?") {
                                for (let shapeTo of to.Pattern.Shapes[0]) {
                                    if (shapeTo != "?") arr.push({ Text: to.Body + shapeTo });
                                }
                            }
                        }
                        break;
                    }
                }
            } else {
                if (this.From + shape == str) {
                    for (let to of this.To) {
                        if (to.Body != "?") {
                            for (let shapeTo of to.Pattern.Shapes[0]) {
                                if (shapeTo != "?") arr.push({ Text: to + shapeTo });
                            }
                        }
                    }
                }
            }
        }
      
        if (ret.length > 0) return { Shapes: ret, Object: this };
        else return null;
    }

    GetTable() {
        for (let to of this.To) {
            if (to.Body != "?") return to.GetTable(to);
        }
    }
}

class ItemPatternVerb {
    constructor() {
        this.Name;

        this.SContinous = false;
        this.SImperative = false;
        this.SPastActive = false;
        this.SPastPassive = false;
        this.SFuture = false;
        this.STransgressiveCont = false;
        this.STransgressivePast = false;
        this.SAuxiliary = false;
    }

    static GetArray(source, pos, len) {
        let arr = [];
        for (let i = pos; i < pos + len; i++) {
            arr.push(source[i]);
        }
        return arr;
    }

    static Load(data,shortcuts) {
        let raw = LoadDataLinePattern(data,shortcuts).split('|');
        let item = new ItemPatternVerb();
        item.Name = raw[0];
        //item.TypeShow=parseInt(raw[1]);
        let num = parseInt(raw[1]);
        item.SContinous = (num & 1) == 1;
        item.SImperative = (num & 2) == 2;
        item.SPastActive = (num & 4) == 4;
        item.SPastPassive = (num & 8) == 8;
        item.SFuture = (num & 16) == 16;
        item.STransgressiveCont = (num & 32) == 32;
        item.STransgressivePast = (num & 64) == 64;
        item.SAuxiliary = (num & 128) == 128;

        item.Type = parseInt(raw[2]);

        // uncompress array
        let arrayOfShapes = LoadArr(raw, 100, 3);
 
        item.Infinitive = arrayOfShapes[0];
       // } else item.Infinitive = arrayOfShapes[0];

        let index = 1;
        //console.log(this);
        //	try {
        if (item.SContinous) {
            item.Continous = this.GetArray(arrayOfShapes, index, 6);
            index += 6;
        }
        if (item.SFuture) {
            item.Future = this.GetArray(arrayOfShapes, index, 6);
            index += 6;
        }
        if (item.SImperative) {
            item.Imperative = this.GetArray(arrayOfShapes, index, 3);
            index += 3;
        }
        if (item.SPastActive) {
            item.PastActive = this.GetArray(arrayOfShapes, index, 8);
            index += 8;
        }
        if (item.SPastPassive) {
            item.PastPassive = this.GetArray(arrayOfShapes, index, 8);
            index += 8;
        }
        if (item.STransgressiveCont) {
            item.TransgressiveCont = this.GetArray(arrayOfShapes, index, 3);
            index += 3;
        }
        if (item.STransgressivePast) {
            item.TransgressivePast = this.GetArray(arrayOfShapes, index, 3);
            index += 3;
        }
        if (item.SAuxiliary) {
            item.Auxiliary = this.GetArray(arrayOfShapes, index, 6);
            index += 6;
        }
        return item;     
    }
}

class ItemVerb {
    constructor() {
        this.From;
        this.PatternFrom;
        this.To = [];
    }

    static Load(data) {
        let raw = data.split('|');
            let item = new ItemVerb();
            item.From = raw[0];

            let paternFrom = this.GetPatternByNameFrom(raw[1]);
            if (paternFrom == null) {
                if (dev) console.log("Cannot load pattern '" + raw[1] + "'");
                return null;
            }
            item.PatternFrom = paternFrom;

            let to = FastLoadTranslateToWithPattern(raw, 2, this);
            if (to == null) {
                return null;
            }
            item.To = to;

            return item;
       // }
    }

    ForeachArr(pattenShapesName, fromIndex, toIndex, num, name, match) {
        let pattenShapes = this.PatternFrom[pattenShapesName];
        if (pattenShapes == undefined) return null;

        for (let i = fromIndex; i < toIndex; i++) {

            let shapes = pattenShapes[i];

            // Multiple choises in source array
            if (Array.isArray(shapes)) {
                for (const s of shapes) {
                    if (s == '?') continue;
                    let shape = this.From + s;

                    if (shape == match) {
                        for (let to of this.To) {
                            //	console.log(to,pattenShapesName,to.Pattern);
                            let patternShapesTo = to.Pattern[pattenShapesName];
                            if (patternShapesTo == undefined) continue;
                            let shapes = patternShapesTo[i];
                            if (!Array.isArray(patternShapesTo[i])) shapes = [shapes];

                            for (const e of shapes) {
                                if (e == '?') continue;
                                this.ret.push({ Text: to.Body + e, Number: num, Person: 1 + i - fromIndex, Form: name });
                            }
                        }
                    }
                }
            } else {
                if (shapes == "-") continue;
                if (shapes == '?') continue;

                let shape = this.From + shapes;

                if (shape == match) {
                    for (let to of this.To) {
                        let patternShapesTo = to.Pattern[pattenShapesName];
                        if (patternShapesTo == undefined) continue;

                        if (Array.isArray(patternShapesTo[i])) {
                            for (const e of patternShapesTo[i]) {
                                if (e == '?') continue;
                                this.ret.push({ Text: to.Body + e, Number: num, Person: 1 + i - fromIndex, Form: name });
                            }
                        } else {
                            if (patternShapesTo[i] == '?') continue;
                            this.ret.push({ Text: to.Body + patternShapesTo[i], Number: num, Person: 1 + i - fromIndex, Form: name });
                            break;
                        }
                    }
                }
            }
        }
    }

    IsStringThisWord(str) {
        if (!str.startsWith(this.From)) { return null; }
        this.ret = [];

        //	for (let to of this.To) {
        this.ForeachArr("Continous", 0, 3, 1, "Continous", str);
        this.ForeachArr("Continous", 3, 6, 2, "Continous", str);

        this.ForeachArr("Future", 0, 3, 1, "Future", str);
        this.ForeachArr("Future", 3, 6, 2, " Future", str);

        this.ForeachArr("PastActive", 0, 4, 1, "PastActive", str);
        this.ForeachArr("PastActive", 4, 8, 2, "PastActive", str);

        this.ForeachArr("PastPassive", 0, 4, 1, "PastPassive", str);
        this.ForeachArr("PastPassive", 4, 8, 2, "PastPassive", str);
        
        this.ForeachArr("TransgressiveCont", 0, 3, 1, "TransgressiveCont", str);
        this.ForeachArr("TransgressivePast", 3, 6, 2, "TransgressivePast", str);

        this.ForeachArr("Auxiliary", 0, 3, 1, "Auxiliary", str);
        this.ForeachArr("Auxiliary", 3, 6, 2, "Auxiliary", str);
        
        this.ForeachArr("Imperative", 0, 1, 1, "Imperative", str);
        this.ForeachArr("Imperative", 1, 2, 2, "Imperative", str);

        {
            for (let infinitive of this.PatternFrom.Infinitive){
              //  console.log(infinitive);
                if (this.From + infinitive == str) {
                    if (Array.isArray(this.To)) {
                        for (let to of this.To) {
                            for (let infinitive_to of to.Pattern.Infinitive) {
                                if (infinitive_to != '?') {
                                    this.ret.push({ Text: to.Body + infinitive_to, Type: "verb", Form: "Infinitive" });
                                }
                            }
                        }
                    } else {
                        //console.log(this);
                        let to = this.To;
                        for (let infinitive_to of to.Pattern.Infinitive) {
                            if (infinitive_to != '?') {
                                this.ret.push({ Text: to.Body + infinitive_to, Type: "verb", Form: "Infinitive" });
                            }
                        }
                    }
                    break;
                }
            }
        }
   
        if (this.ret.length == 0) return null;
        else return { Shapes: this.ret, Object: this };

    }

    static GetPatternByNameFrom(name) {
        for (const p of ItemVerb_pattensFrom) {
            if (p.Name == name) return p;
        }
    }

    static GetPatternByNameTo(name) {
        for (const p of ItemVerb_pattensTo) {
            if (p.Name == name) return p;
        }
    }

    TryDicForm(to, varible, index) {
        if (this.PatternFrom[varible]==undefined) return null;

        //From_one
        let str_from_one; 
        let from_pattern;
        if (index==undefined) from_pattern=this.PatternFrom[varible];
        else from_pattern=this.PatternFrom[varible][index];

        if (Array.isArray(from_pattern)) {
            for (let f of from_pattern) {
                if (f != "?") {
                    str_from_one=this.From+f;
                    break;
                }
            }
        } else {
            if (from_pattern == "?") return null;
            else str_from_one=this.From+from_pattern;
        }
        if (str_from_one==undefined) return null;

        if (to.Pattern==undefined) return null;

        // To
        if (to.Pattern[varible]==undefined) return null;
        let str_to=[];
        let found=false;        
        let pattern_to;        
        if (index==undefined) pattern_to=to.Pattern[varible];
        else pattern_to=to.Pattern[varible][index];

        if (Array.isArray(pattern_to)) {
            for (let pforms of pattern_to) {
                if (!pforms.includes('?')) str_to.push(to.Body +pforms);
            }
            if (str_to.length>0) {
                found=true;
            }
        } else {
            if (!pattern_to.includes('?')) {
                str_to.push(pattern_to);
                found = true;
            }
        }

        if (found) return {"From_one": str_from_one, "To_strs": str_to, "To": to, "Varible": varible, "Index": index};
        else return null;
    }
}

class Replace {
    constructor() {
        this.Input = [];
        this.Output = [];
    }
}

class LanguageTr {
    constructor() {
        this.Name = "";
        this.Sentences = [];
        this.Phrases = [];
        this.state = "instanced";
        this.SelectReplace = [];
        this.SentencePatterns = [];
        this.SentencePatternParts = [];
        this.SentenceParts = [];
        //	dev=false;
        this.SimpleWords = [];
        this.PatternNounsFrom = [];
        this.PatternNounsTo = [];
        this.PatternAdjectivesFrom = [];
        this.PatternAdjectivesTo = [];
        this.PatternPronounsFrom = [];
        this.PatternPronounsTo = [];
        this.PatternNumbersFrom = [];
        this.PatternNumbersTo = [];
        this.PatternVerbsFrom = [];
        this.PatternVerbsTo = [];
        this.Nouns = [];
        this.Pronouns = [];
        this.Verbs = [];
        this.Adjectives = [];
        this.Numbers = [];
        this.Prepositions = [];
        this.Interjections = [];
        this.Particles = [];
        this.Adverbs = [];
        this.Conjunctions = [];
        this.option = undefined;
        this.ReplaceS = [];
        this.ReplaceG = [];
        this.ReplaceE = [];

        this.MakeBold = "\x1b[1m";
        this.MakeUnderline = "\x1b[4m";
        this.MakeGreen = "\x1b[32m";
        this.MakeBlue = "\x1b[34m";
        this.MakeCyan = "\x1b[36m";

        this.qualityTrTotalTranslatedWell = 0.0;
        this.qualityTrTotalTranslated = 0.0;

        this.locationX = NaN;
        this.locationY = NaN;
        this.gpsX = NaN;
        this.gpsY = NaN;
        this.Quality = 0;
        this.Author = "";
        this.LastDateEdit = "";
        this.Comment = "";
        this.baseLangName = null;
    }

    Stats() {
        let stats = 0;
        stats += this.SimpleWords.length;
        stats += this.Phrases.length;
        stats += this.SentenceParts.length;
        stats += this.Sentences.length;

        stats += this.Nouns.length;
        stats += this.Adjectives.length;
        stats += this.Pronouns.length;
        stats += this.Numbers.length;
        stats += this.Verbs.length;
        stats += this.Adverbs.length;
        stats += this.Prepositions.length;
        stats += this.Conjunctions.length;
        stats += this.Particles.length;
        stats += this.Interjections.length;

        return stats;
    }

    Finished() {
        if (this.Comment.includes("nezpracováno")) return "0";
        if (this.Comment.includes("nezpracovano")) return "0";
        if (this.Comment.includes("nezpracované")) return "0";
        if (this.Comment.includes("nevyčerpáno")) return "0";
        if (this.Comment.includes("nevyčerpáné")) return "0";

        return "1";
    }

    Load(lines) {
        this.state = "loading";
      //  enabletranslate = true;
        if (fullDev) console.log("INFO| Parsing " + this.Name);
        // Head
        let i = 0;
        for (; i < lines.length; i++) {
            let line = lines[i];

            if (line == "-") break;
            let subtype = line.substring(0, 1);
            switch (subtype) {
                // Comment info
                case "i":
                    this.Info = line.substring(1).replaceAll(/\\r?\\n/, "<br>");
                    break;
                    
                case "b":
                   /* let rawDataCites=line.substring(1);
                    this.Cites=[];
                    for (let line of rawDataCites.split("\\n")){
                        let p=new Cite();
                        if (p.BuildReference(line)){
                            this.Cites.push(p);
                        }
                    }   */                
                    break;

                    //case "a":
                    //	this.Author = line.substring(1);
                    //	break;

                    //	case "d":
                    //	this.LastDateEdit = line.substring(1);
                    //	break;

                    //case "f":
                    //	this.From= line.substring(1);
                    //	break;

                case "t":
                    this.Name = line.substring(1);
                    break;

                case "u":
                    this.Country = parseInt(line.substring(1));
                    break;

                case "r":
                    this.Names = [];
                    for (let l of line.substring(1).split(",")) {
                        let v=l.split("=");
                        this.Names[v[0]]=v[1];
                    }
                    break;

                /*case "e":
                    this.BuildSelect(line.substring(1));
                    break;*/

                case "c":
                    {
                        let stri = line.substring(1);
                        //		if (stri instanceof String || typeof myVar === 'string') {
                        let l = stri.replaceAll(/\r?\n/, "\n").replaceAll("->", "➔").split('\\n');
                        let text = "";
                        let ul = false;
                        for (let i of l) {
                            if (i.startsWith("#")) {
                                if (ul) {
                                    text += '</ul>';
                                    ul = false;
                                }
                                text += '<p style="display:inline-block" class="settingHeader">' + i.substring(1) + '</p>';
                            } else if (i.startsWith("-")) {
                                if (!ul) text += '<ul>';
                                text += '<li>' + i.substring(1) + '</li>';
                                ul = true;
                            } else if (i == "") {
                                if (ul) {
                                    text += '</ul>';
                                    ul = false;
                                }
                                text += '<br>';
                            } else {
                                if (ul) {
                                    text += '</ul>';
                                    ul = false;
                                }
                                text += '<p>' + i + '</p>';
                            }

                        }
                        this.Comment = text;
                        //	}
                    }
                    break;

                case "g":
                    {
                        let GPS = line.substring(1);
                        //console.log(GPS);
                        if (GPS.includes(',')) {
                            let rawPos = GPS.split(',');
                            this.gpsX = parseFloat(rawPos[1]);
                            this.gpsY = parseFloat(rawPos[0]);

                            // Do not remove
                            //let originX=14.6136976, originY=50.4098883,scX=4.07, scY=1.8483;
                            //this.locationX=(((this.gpsY-originX)/scX)*170*1.21-20.92)*3.8;
                            //this.locationY=((-(this.gpsX-originY)/scY)*150*1.0367+3.4)*3.8;
                            //if (this.Name=="Nymburk" || this.Name=="Rybnik" || this.Name=="Handlova")console.log(this.Name, this.gpsY, this.locationY);

                            //	let xZ=686/3.6173147-5, xM=14.87480,
                            //	    yZ=415/1.4573454,   yM=48.41226;
                            //	this.locationX=(this.gpsY-xM)*xZ-15;
                            //	this.locationY=566-(this.gpsX-yM)*yZ+30;

                            let xZ = 186.4808940233115,
                                xM = 14.994628083116883,
                                yZ = -286.1366975872704,
                                yM = 50.50019567841726;
                            this.locationX = (this.gpsX - xM) * xZ;
                            this.locationY = (this.gpsY - yM) * yZ;

                            //console.log(this.locationX, this.locationY)
                        }
                    }
                    break;

                case "q":
                    this.Quality = parseFloat(line.substring(1));
                    break;

                case "l":
                    this.lang = line.substring(1);
                    break;

                case "o":
                    this.Category = line.substring(1).split('>');
                    break;

                    /*	case "z":
                    		this.baseLangName=line.substring(1);
                    		break;*/
            }
        }


           // SentencePattern
           for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemSentencePattern.Load(line);
            if (item !== null && item !== undefined) this.SentencePatterns.push(item);
            else if (dev) console.warn("Cannot load 'SentencePattern' item at line " + i + ". ", line);
        }
        if (fullDev) console.log("🔣 Loaded SentencePatterns", this.SentencePatterns);

        // SentencePartPattern
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemSentencePatternPart.Load(line);
            if (item !== null && item !== undefined) this.SentencePatternParts.push(item);
            else if (dev) console.warn("Cannot load 'SentencePartPattern' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded SentencePartPatterns", this.SentencePartPatterns);


        // Sentences
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemSentence.Load(line);
            if (item !== null && item !== undefined) this.Sentences.push(item);
            else if (dev) console.warn("Cannot load 'Sentence' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded Sentences", this.Sentences);

        // SentencesParts
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemSentencePart.Load(line);
            if (item !== null && item !== undefined) this.SentenceParts.push(item);
            else if (dev) console.warn("Cannot load 'SentencePart' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded SentenceParts", this.SentenceParts);


        // Phrase
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemPhrase.Load(line);
            if (item !== null && item !== undefined) this.Phrases.push(item);
            else if (dev) console.warn("Cannot load 'Phrase' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded Phrases", this.Phrases);

        // SimpleWords
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemSimpleWord.Load(line);
            if (item !== null && item !== undefined) this.SimpleWords.push(item);
            else if (dev) console.warn("Cannot load 'SimpleWord' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded SimpleWords", this.SimpleWords);


        // ReplaceS
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemReplaceS.Load(line);
            if (item !== null && item !== undefined) this.ReplaceS.push(item);
            else if (dev) console.warn("Cannot load 'ReplaceS' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded ReplaceSs", this.ReplaceS);
        this.ReplaceS.sort((a, b) => (a.input.length < b.input.length) ? 1 : -1);

        // ReplaceG
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemReplaceG.Load(line);
            if (item !== null && item !== undefined) this.ReplaceG.push(item);
            else if (dev) console.warn("Cannot load 'ReplaceG' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded ReplaceGs", this.ReplaceG);
        this.ReplaceG.sort((a, b) => (a.input.length < b.input.length) ? 1 : -1);

        // ReplaceE
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemReplaceE.Load(line);
            if (item !== null && item !== undefined) this.ReplaceE.push(item);
            else if (dev) console.warn("Cannot load 'ReplaceE' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded ReplaceEs", this.ReplaceE);


        // PatternNounFrom
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemPatternNoun.Load(line,sPatternNounFrom);
            if (item !== null && item !== undefined) this.PatternNounsFrom.push(item);
            else if (dev) console.warn("Cannot load 'PatternNoun' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded PatternNounsFrom", this.PatternNounsFrom);

        // PatternNounTo
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemPatternNoun.Load(line,sPatternNounTo);
            if (item !== null && item !== undefined) this.PatternNounsTo.push(item);
            else if (dev) console.warn("Cannot load 'PatternNoun' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded PatternNounsTo", this.PatternNounsTo);

        // Noun
        ItemNoun_pattensFrom = this.PatternNounsFrom;
        ItemNoun_pattensTo = this.PatternNounsTo;
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemNoun.Load(line);
            if (item !== null && item !== undefined) this.Nouns.push(item);
            else if (dev) console.warn("Cannot load 'Noun' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded Nouns", this.Nouns);

        // PatternAdjectivesFrom
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemPatternAdjective.Load(line,sPatternAdjectiveFrom);
            if (item !== null && item !== undefined) this.PatternAdjectivesFrom.push(item);
            else if (dev) console.warn("Cannot load 'PatternAdjective' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded PatternAdjectivesFrom", this.PatternAdjectivesFrom);

        // PatternAdjectivesTo
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemPatternAdjective.Load(line,sPatternAdjectiveTo);
            if (item !== null && item !== undefined) this.PatternAdjectivesTo.push(item);
            else if (dev) console.warn("Cannot load 'PatternAdjective' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded PatternAdjectivesTo", this.PatternAdjectivesTo);

        // Adjectives
        ItemAdjective_pattensFrom = this.PatternAdjectivesFrom;
        ItemAdjective_pattensTo = this.PatternAdjectivesTo;
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemAdjective.Load(line);
            if (item !== null && item !== undefined) this.Adjectives.push(item);
            else if (dev) console.warn("Cannot load 'Adjective' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded Adjectives", this.Adjectives);

        // PatternPronounsFrom
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemPatternPronoun.Load(line,sPatternPronounFrom);
            if (item !== null && item !== undefined) this.PatternPronounsFrom.push(item);
            else if (dev) console.warn("Cannot load 'PatternPronoun' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded PatternPronounsFrom", this.PatternPronounsFrom);

        // PatternPronounsTo
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemPatternPronoun.Load(line,sPatternPronounTo);
            if (item !== null && item !== undefined) this.PatternPronounsTo.push(item);
            else if (dev) console.warn("Cannot load 'PatternPronoun' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded PatternPronounsTo", this.PatternPronounsTo);

        // Pronouns
        ItemPronoun_pattensFrom = this.PatternPronounsFrom;
        ItemPronoun_pattensTo = this.PatternPronounsTo;
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemPronoun.Load(line);
            if (item !== null && item !== undefined) this.Pronouns.push(item);
            else if (dev) console.warn("Cannot load 'Pronoun' item at line " + i + ". Data: ", line);
        }
        if (fullDev) console.log("🔣 Loaded Pronouns", this.Pronouns);

        // PatternNumbersFrom
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemPatternNumber.Load(line,sPatternNumberFrom);
            if (item !== null && item !== undefined) this.PatternNumbersFrom.push(item);
            else if (dev) console.warn("Cannot load 'PatternNumber' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded PatternNumbersFrom", this.PatternNumbersFrom);

        // PatternNumbersTo
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemPatternNumber.Load(line,sPatternNumberTo);
            if (item !== null && item !== undefined) this.PatternNumbersTo.push(item);
            else if (dev) console.warn("Cannot load 'PatternNumber' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded PatternNumbersTo", this.PatternNumbersTo);

        // Numbers
        ItemNumber_pattensFrom = this.PatternNumbersFrom;
        ItemNumber_pattensTo = this.PatternNumbersTo;
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemNumber.Load(line);
            if (item !== null && item !== undefined) this.Numbers.push(item);
            else if (dev) console.warn("Cannot load 'Number' item at line " + i + ", data: ", line);
        }
        if (fullDev) console.log("🔣 Loaded Numbers", this.Numbers);

        // PatternVerbsFrom
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemPatternVerb.Load(line,sPatternVerbFrom);
            if (item !== null && item !== undefined) this.PatternVerbsFrom.push(item);
            else if (dev) console.warn("Cannot load 'PatternVerb' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded PatternVerbsFrom", this.PatternVerbsFrom);

        // PatternVerbsTo
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemPatternVerb.Load(line,sPatternVerbTo);
            if (item !== null && item !== undefined) this.PatternVerbsTo.push(item);
            else if (dev) console.warn("Cannot load 'PatternVerb' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded PatternVerbsTo", this.PatternVerbsTo);

        // Verb
        ItemVerb_pattensFrom = this.PatternVerbsFrom;
        ItemVerb_pattensTo = this.PatternVerbsTo;
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemVerb.Load(line);
            if (item !== null && item !== undefined) this.Verbs.push(item);
            else if (dev) console.warn("Cannot load 'Verb' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded Verbs", this.Verbs);

        this.OptimizeAfterLoad();

        // Adverb
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemAdverb.Load(line, sAdverb);
            if (item !== null && item !== undefined) this.Adverbs.push(item);
            else if (dev) console.warn("Cannot load 'Adverb' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded Adverbs", this.Adverbs);

        // Preposition
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemPreposition.Load(line);
            if (item !== null && item !== undefined) this.Prepositions.push(item);
            else if (dev) console.warn("Cannot load 'Preposition' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded Prepositionss", this.Prepositions);

        // Conjunction
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemAdverb.Load(line, sConjunction);
            if (item !== null && item !== undefined) this.Conjunctions.push(item);
            else if (dev) console.warn("Cannot load 'Conjunction' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded Conjunctions", this.Conjunctions);

        // Particle
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemAdverb.Load(line, sParticle);
            if (item !== null && item !== undefined) this.Particles.push(item);
            else if (dev) console.warn("Cannot load 'Particle' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded Particles", this.Particles);

        // Interjection
        for (i++; i < lines.length; i++) {
            let line = lines[i];
            if (line == "-") break;

            let item = ItemAdverb.Load(line, sInterjection);
            if (item !== null && item !== undefined) this.Interjections.push(item);
            else if (dev) console.warn("Cannot load 'Interjection' item at line " + i, line);
        }
        if (fullDev) console.log("🔣 Loaded Interjections", this.Interjections);


        this.ReplaceE.sort((a, b) => (a.input.length < b.input.length) ? 1 : -1);

        this.state = "loaded";
    }

    // Optimize memory
    OptimizeAfterLoad() {
        for (let pattern of this.PatternNounsFrom) {
            pattern.Name = undefined;
        }
        for (let pattern of this.PatternNounsTo) {
            pattern.Name = undefined;
        }

        for (let pattern of this.PatternAdjectivesFrom) {
            pattern.Name = undefined;
        }
        for (let pattern of this.PatternAdjectivesTo) {
            pattern.Name = undefined;
        }

        for (let pattern of this.PatternPronounsFrom) {
            pattern.Name = undefined;
        }
        for (let pattern of this.PatternPronounsTo) {
            pattern.Name = undefined;
        }

        for (let pattern of this.PatternNumbersFrom) {
            pattern.Name = undefined;
        }
        for (let pattern of this.PatternNumbersTo) {
            pattern.Name = undefined;
        }

        for (let pattern of this.PatternVerbsFrom) {
            pattern.Name = undefined;
        }
        for (let pattern of this.PatternVerbsTo) {
            pattern.Name = undefined;
        }
    }

    GetDic(input) {
        function IsWordIncluded(w) {
            if (Array.isArray(w)) {
                for (let c of w) {
                    if (c.includes(input)) {
                        return true;
                    }
                }
                return false;
            } else {
                return w.startsWith(input);
            }
        }

        function IsWordComIncluded(w) {
            if (w.PatternFrom == null) return false;
            let shape = w.PatternFrom.Shapes;
            if (shape[0] != "?" && shape[0] != "-") {
                let ww = w.From + shape[0];
                return ww.startsWith(input);
            }
            return null;
        }

        function IsWordVerbIncluded(w) {
            if (w.PatternFrom == null) return false;
            let shape = w.PatternFrom.Infinitive;
            let ww = w.From + shape;

            return ww.startsWith(input);
        }

        function IsWordAdjIncluded(w) {
            if (w.PatternFrom == null) return false;
            let shape = w.PatternFrom.MasculineAnimate[0];
            let ww = w.From + shape;

            return ww.startsWith(input);
        }

        let out = [];
        let total = 0;
        for (let w of this.Phrases) {
            //			console.log(w.input);
            if (IsWordIncluded(w.input)) {
                let g = w.GetDicForm();
                if (g != null) out.push(g);
                total++;
            }
        }
        for (let w of this.Adverbs) {
            if (IsWordIncluded(w.input)) {
                //	console.log(w);				
                let g = w.GetDicForm("přís.");
                if (g != null) out.push(g);
                total++;
            }
        }
        for (let w of this.Particles) {
            if (IsWordIncluded(w.input)) {
                let g = w.GetDicForm("část.");
                if (g != null) out.push(g);
                total++;
            }
        }
        for (let w of this.Conjunctions) {
            if (IsWordIncluded(w.input)) {
                let g = w.GetDicForm("spoj.");
                if (g != null) out.push(g);
                total++;
            }
        }
        for (let w of this.Interjections) {
            if (IsWordIncluded(w.input)) {
                let g = w.GetDicForm("cito.");
                if (g != null) out.push(g);
                total++;
            }
        }

        for (let w of this.SimpleWords) {
            if (IsWordIncluded(w.input)) {
                let g = w.GetDicForm("");
                if (g != null) out.push(g);
                total++;
            }
        }

        for (let w of this.Sentences) {
            if (IsWordIncluded(w.input)) {
                let g = w.GetDicForm("věta");
                if (g != null) out.push(g);
                total++;
            }
        }

        for (let w of this.SentenceParts) {
            if (IsWordIncluded(w.input)) {
                let g = w.GetDicForm("část věty");
                if (g != null) out.push(g);
                total++;
            }
        }

        for (let w of this.Nouns) {
            if (IsWordComIncluded(w)) {
                let g = w.GetDicForm();
                if (g != null) out.push(g);
                total++;
            }
        }

        for (let w of this.Pronouns) {
            if (IsWordComIncluded(w)) {
                let g = w.GetDicForm();
                if (g != null) out.push(g);
                total++;
            }
        }
        for (let w of this.Verbs) {
            if (IsWordVerbIncluded(w)) {
                let g = w.GetDicForm();
                if (g != null) out.push(g);
                total++;
            }
        }

        for (let w of this.Adjectives) {
            if (IsWordAdjIncluded(w)) {
                let g = w.GetDicForm();
                if (g != null) out.push(g);
                total++;
            }
        }

        for (let w of this.Numbers) {
            if (IsWordComIncluded(w)) {
                let g = w.GetDicForm();
                if (g != null) out.push(g);
                total++;
            }
        }

        for (let w of this.Prepositions) {
            if (IsWordIncluded(w.input)) {
                let g = w.GetDicForm();
                if (g != null) out.push(g);
                total++;
            }
        }

        let display;
        /*if (!dev){
        	for (let i=0; i<out.length; i++) {
        		if (out[i].join("").includes("undefined")) {
        			out.splice(i, 1);
        		}
        	}
        }*/

        // Nenalezeno
        if (out == "") {
            display = document.createElement("p");
            display.style = "font-style: italic";
            display.innerText = "Nenalezen žádný záznam.";
        } else if (total == 1) {
            display = document.createElement("p");
            display.style = "font-style: italic";
            display.innerText = "Nalezen " + total + " záznam.";
        } else if (total < 5) {
            display = document.createElement("p");
            display.style = "font-style: italic";
            display.innerText = "Nalezeny " + total + " záznamy.";
        } else {
            display = document.createElement("p");
            display.style = "font-style: italic";
            display.innerText = "Nalezeno celkem " + total + " záznamů.";
        }

        // Setřídit
        out = out.sort((a, b) => {
            if (typeof a.from == 'string') return a.from.localeCompare(b.from);
            else {
                if (dev) console.log("Type is not string", typeof a.from, a);
                return false;
            }
        });
        lastDic = out;

        // Zkrátit
        let zkr = false;
        if (!dicAbc) {
            if (out.length > 50) {
                out.splice(50, out.length - 50);
                zkr = true;
            }
        }

        display = document.createElement("div");
        
        if (out.length == 0) {
            let no = document.createElement("p");
            no.style = "font-style: italic";
            no.innerText = "Slovníček tohoto místa je prázdný.";
            display.appendChild(no);
            return display;
        }

        let lastCh="";
        if (out.length != 0) {
            for (let z of out) {
                if (dicAbc) {
                    if (z.from[0].toLowerCase()!=lastCh.toLowerCase()) {
                        let ch=document.createElement("p");
                        ch.innerText=z.from[0].toUpperCase();
                        ch.className="abcCh";
                        display.appendChild(ch);
                        
                        lastCh=z.from[0];
                    }
                }
                //if (typeof z[3] === "string") {
                //if (z[2]=="") display+="<p>"+z[0]+" → "+z[1]+"  <i>"+z[3]+"</i></p>";
                //else display+="<p>"+z[0]+" → "+z[1]+"; "+z[2]+"  <i>"+z[3]+"</i></p>";
                //} else 
                //	console.log(z);
                display.appendChild(z.element);
            }
        }
        if (zkr) {
            let zkr = document.createElement("p");
            zkr.style = "font-style: italic";
            zkr.innerText = "Nalezeno celkem " + total + " záznamů.";
            display.appendChild(zkr);
        }

        return display;
    }

    Translate(input) {
        //this.htmlCodeTranslate=true;

        if (dev) console.log("📝 Translating " + this.Name + "...");

        let stringOutput = "";

        let sentences = this.SplitStringTags(input,".!?", true);

        for (let i = 0; i < sentences.length; i++) {
            let currentSentenceS = sentences[i];

            let isTag=currentSentenceS.Tag;

            let currentSentence = currentSentenceS.String;//currentSentenceS /*[1]*/ ;
            if (dev) console.log("📘 \x1b[1m\x1b[34mCurrent Sentence: ", currentSentence);

            if (isTag) {
                stringOutput+=currentSentence;
                continue;
            }

            // Add . ? !
            //	if (!currentSentenceS[0]) {
            //		this.AddText(currentSentence, output, "symbol");
            //		continue;
            //	}

            // In cases like ... or !!! or !?
            if (currentSentence == "") continue;


            // Simple replece full sentences
            let m = this.matchSentence(currentSentence);
            if (m !== null) {
                this.AddText(m.output);
                continue;
            }

            // Sentence pattern
            let patternDone = this.SolveSentencePattern(currentSentence);
            if (patternDone != null) {

                let space = document.createTextNode(" ");
                output.appendChild(space);

                output.appendChild(patternDone);
                continue;
            }

            if (dev) console.log("Sentence pattern not found", currentSentence);

            // Words
            let unknownPattern;
            //		let sent=currentSentence.substring(currentSentence.length-1);

            let words = this.MultipleSplit(currentSentence, "  ,-:;'\t_.!?„“\n[]");

            let BuildingSentence = [];
            /*
            Create sencence without relationships
            arr = ["string to draw", ["noun/adjective/symbol", other options, ..]]
            */
            for (let w = 0; w < words.length; w++) {
                let currentWord = words[w];
                let Zword = currentWord[1];
                let word = Zword.toLowerCase();

                // Phrases?

                // Customword
                {
                    let cw = this.CustomWord(word);
                    if (cw != null) {
                        if (dev) console.log(cw);
                        BuildingSentence.push(cw);
                        continue;
                    }
                }

                // separator
                if (!currentWord[0]) {
                    let repair = this.normalizeSymbols(word);
                    BuildingSentence.push({ Type: "Symbol", To: repair, From: Zword });
                    continue;
                }

                // Phases apply
                let phr = this.ApplyPhrases(words, w);
                if (phr != null) {
                    BuildingSentence.push(phr);
                    continue;
                }

                // foreach words
                /*	{
                		let n=this.searchWordPhrase(word);
                		if (n!=null) {
                			BuildingSentence.push(["Phrase", n, Zword]);
                			continue;
                		}
                	}*/
                {
                    let n = this.searchWordNoun(word);
                    if (n != null) {
                        // n=[[tvar, číslo, pád], rod];
                        BuildingSentence.push({ Type: "Noun", To: n, From: Zword });
                        continue;
                    }
                } {
                    let n = this.searchWordAdjective(word);
                    if (n != null) {
                        // n=[[tvar, číslo, pád], rod];
                        BuildingSentence.push({ Type: "Adjective", To: n, From: Zword });
                        continue;
                    }
                } {
                    let n = this.searchWordPronoun(word);
                    if (n != null) {
                        // n=[[tvar, číslo, pád], rod];
                        BuildingSentence.push({ Type: "Pronoun", To: n, From: Zword });
                        continue;
                    }
                } {
                    let n = this.searchWordNumber(word);
                    if (n != null) {
                        // n=[[tvar, číslo, pád], rod];
                        BuildingSentence.push({ Type: "Number", To: n, From: Zword });
                        continue;
                    }
                } {
                    let n = this.searchWordVerb(word);
                    if (n != null) {
                        // n=[[tvar, číslo, pád], rod];
                        BuildingSentence.push({ Type: "Verb", To: n, From: Zword });
                        continue;
                    }
                } {
                    let n = this.searchWordAdverb(word);
                    if (n != null) {
                        BuildingSentence.push({ Type: "Adverb", To: n, From: Zword });
                        continue;
                    }
                } {
                    let n = this.searchWordPreposition(word);
                    if (n != null) {
                        // n=[out, falls];
                        let out = n[0];
                        let falls = n[1];
                        BuildingSentence.push({ Type: "Preposition", To: n, From: Zword });
                        continue;
                    }
                } {
                    let n = this.searchWordParticle(word);
                    if (n != null) {
                        BuildingSentence.push({ Type: "Particle", To: n, From: Zword });
                        continue;
                    }
                } {
                    let n = this.searchWordConjunction(word);
                    if (n != null) {
                        BuildingSentence.push({ Type: "Conjunction", To: n, From: Zword });
                        continue;
                    }
                } {
                    let n = this.searchWordInterjection(word);
                    if (n != null) {
                        BuildingSentence.push({ Type: "Interjection", To: n, From: Zword });
                        continue;
                    }
                } {
                    let n = this.searchSimpleWord(word);
                    if (n != null) {
                        BuildingSentence.push({ Type: "SimpleWord", To: n, From: Zword });
                        continue;
                    }
                } {
                    // If is number
                    if (isNumber(word)) { // === +word
                        BuildingSentence.push({ Type: "NumberLetters", To: word, From: Zword });
                        continue;
                    }
                }

                // Add unknown word
                let TryReplaces = this.ReplaceWord(word);
                BuildingSentence.push({ Type: "Unknown", To: TryReplaces, From: Zword });
                continue;
            }

            if (dev) console.log("Sencence.. Before relationship.. ", BuildingSentence);

            // Create relationships
            // Po předložce nastav u podtatného nebo přídavného pád a rod
            let startIndex = -1,
                endIndex = -1;
            for (let w = 0; w < BuildingSentence.length; w++) {
                let word = BuildingSentence[w];
                if (word[0] == "Preposition") {
                    if (startIndex == -1) {
                        startIndex = w;
                    } else {
                        endIndex = w - 1;
                        //	MakeprepositionAdjectiveNounRelationShip(BuildingSentence, startIndex, endIndex);
                        startIndex = -1;
                        endIndex - 1;
                    }
                } else if (word.Type == "Noun" || word.Type == "Adjective" || word.Type == "Number") {} else {
                    if (startIndex != -1) {
                        endIndex = w - 1;
                        //	MakeprepositionAdjectiveNounRelationShip(BuildingSentence, startIndex, endIndex);
                        startIndex = -1;
                        endIndex - 1;
                    }
                }
            }

            if (dev) console.log("Sencence.. With relationship.. ", BuildingSentence);

            // Print
            for (let w = 0; w < BuildingSentence.length; w++) {
                let word = BuildingSentence[w];
                let type = word.Type;
                let string = word.To;
                let original = word.From;

                //				console.log(word);

                let printableString;
                if (type == "Noun") {
                    printableString = string.Shapes;
                } else if (type == "Adjective") printableString = string;
                else if (type == "Pronoun") printableString = string.Shapes;
                else if (type == "Number") printableString = string.Shapes;
                else if (type == "Verb") printableString = string.Shapes;
                else if (type == "Adverb") {
                    printableString = string.output[0].Text;
                } else if (type == "Preposition") printableString = string[0];
                else if (type == "Conjunction") {
                    printableString = string.output[0].Text;
                } else if (type == "Phrase") {
                    if (Array.isArray(string)) printableString = string[0].Text.join(" ");
                    else printableString = string.Text.join(" ");
                } else if (type == "Particle") {
                    printableString = string.output[0].Text;
                } else if (type == "Interjection") {
                    printableString = string.output[0].Text;
                } else if (type == "Symbol") printableString = string;
                else if (type == "Unknown") {
                    if (Array.isArray(string)) printableString = string[0];
                    else printableString = string;
                } else if (type == "SimpleWord") {
                    printableString = string.output;
                    //console.log(printableString, string);
                } else if (type == "NumberLetters") printableString = string;
                else if (type == "Check") printableString = string;
                else if (type == "Special") printableString = string;
                else {
                    if (dev) console.log("⚠️ Unknown type", string);
                    printableString = string.To;
                }

                //	if (html) {
                // Write how well translated
                if (type !== "Unknown" && type !== "Symbol") this.qualityTrTotalTranslatedWell++;
                if (type !== "Symbol") this.qualityTrTotalTranslated++;

                let resStr = this.PrepareText(printableString);
                let retText;

                // All uppercase				
                if (original == original.toUpperCase()) {
                    if (Array.isArray(resStr)) {
                        let arr = [];
                        for (let x of resStr) arr.push(x.toUpperCase());
                        retText = arr;
                    } else {
                        retText = resStr.toUpperCase();
                    }

                    // All uppercase
                } else if (original[0] == original[0].toUpperCase()) {
                    if (Array.isArray(resStr)) {
                        let arr = [];
                        for (let x of resStr) {
                            if (x.length == 0) continue;
                            if (x.length == 1) {
                                arr.push(x[0].toUpperCase());
                            } else {
                                arr.push(x[0].toUpperCase() + x.substring(1));
                            }
                        }
                        retText = arr;
                    } else {
                        if (resStr.length > 0) {
                            retText = resStr[0].toUpperCase() + resStr.substring(1);
                        } else retText = resStr;
                    }
                } else {
                    retText = resStr;
                }

                stringOutput += this.AddText(retText);
            }
            stringOutput += " ";
        }

        return stringOutput;
    }
    
    normalizeSymbols(symbol) {
        // Správné uvozovky
        if (symbol == '"') return '“';
        if (symbol == "'") return '‘';
        //if (symbol=="\n") return '<br>';

        // nbsp
        if (symbol == " ") return ' ';

        return symbol;
    }

    matchSentence(input) {
        if (!input.endsWith("!") && !input.endsWith("?") && !input.endsWith(".")) {

            for (const s of this.Sentences) {
                //	console.log(s.input.substring(0, s.input.length-1));
                if (s.input.length > 2) {
                    if (s.input.substring(0, s.input.length - 1) == input) return s;
                    //if (s.input==input) return s;
                }
            }
            return null;

        }
        for (const s of this.Sentences) {
            if (s.input == input) return s;
        }
        return null;
    }

    searchWordNoun(input) {
        for (const n of this.Nouns) {
            let z = n.IsStringThisWord(input);
            if (z !== null) return z;
        }
        return null;
    }

    searchExists(input) {
        //<{exists=ł}>
        for (const n of this.SimpleWords) {
            for (let to of n.output) {
                if (to.Text.includes(input)) return n;
            }
        }
        for (const n of this.Sentences) {
            for (let to of n.output) {
                if (to.Text.includes(input)) return n;
            }
        }
        for (const n of this.SentenceParts) {
            for (let to of n.output) {
                if (to.Text.includes(input)) return n;
            }
        }
        for (const n of this.Phrases) {
            for (let to of n.output) {
                if (to.Text.includes(input)) return n;
            }
        }
        for (const n of this.Adverbs) {
            for (let to of n.output) {
                if (to.Text.includes(input)) return n;
            }
        }
        for (const n of this.Prepositions) {
            for (let to of n.output) {
                if (to.Text.includes(input)) return n;
            }
        }
        for (const n of this.Particles) {
            for (let to of n.output) {
                if (to.Text.includes(input)) return n;
            }
        }
        for (const n of this.Conjunctions) {
            for (let to of n.output) {
                if (to.Text.includes(input)) return n;
            }
        }
        for (const n of this.Interjections) {
            for (let to of n.output) {
                if (to.Text.includes(input)) return n;
            }
        }
        for (const n of this.Nouns) {
            for (let to of n.To) {
                if (to.Body.includes(input)) return n;
                for (let shape of to.Pattern.Shapes) {
                    if (!Array.isArray(shape)) shape = [shape];
                    for (let s of shape) {
                        if (s.includes(input)) return n;
                    }
                }
            }
        }
        for (const n of this.Adjectives) {
            for (let to of n.To) {
                if (to.Body.includes(input)) return n;
                for (let shape of to.Pattern.Middle) {
                    if (shape.includes(input)) return n;
                }
                for (let shape of to.Pattern.Feminine) {
                    if (shape.includes(input)) return n;
                }
                for (let shape of to.Pattern.MasculineAnimate) {
                    if (shape.includes(input)) return n;
                }
                for (let shape of to.Pattern.MasculineInanimate) {
                    if (shape.includes(input)) return n;
                }
            }
        }
        for (const n of this.Pronouns) {
            for (let to of n.To) {
                if (to.Body.includes(input)) return n;
                for (let shape of to.Pattern.Shapes) {
                    if (!Array.isArray(shape)) shape = [shape];
                    for (let s of shape) {
                        if (s.includes(input)) return n;
                    }
                }
            }
        }
        for (const n of this.Numbers) {
            for (let to of n.To) {
                if (to.Body.includes(input)) return n;
                for (let shape of to.Pattern.Shapes) {
                    if (!Array.isArray(shape)) shape = [shape];
                    for (let s of shape) {
                        if (s.includes(input)) return n;
                    }
                }
            }
        }
        for (const n of this.Verbs) {
            for (let to of n.To) {
                if (to.Body.includes(input)) return n;
                if (to.Pattern.SContinous) {
                    for (let shape of to.Pattern.Continous) {
                        if (!Array.isArray(shape)) shape = [shape];
                        for (let s of shape) {
                            if (s.includes(input)) return n;
                        }
                    }
                }
                if (to.Pattern.SFuture) {
                    for (let shape of to.Pattern.Future) {
                        if (!Array.isArray(shape)) shape = [shape];
                        for (let s of shape) {
                            if (s.includes(input)) return n;
                        }
                    }
                }
                if (to.Pattern.SPastActive) {
                    for (let shape of to.Pattern.PastActive) {
                        if (!Array.isArray(shape)) shape = [shape];
                        for (let s of shape) {
                            if (s.includes(input)) return n;
                        }
                    }
                }
                if (to.Pattern.SPastPasive) {
                    for (let shape of to.Pattern.PastPasive) {
                        if (!Array.isArray(shape)) shape = [shape];
                        for (let s of shape) {
                            if (s.includes(input)) return n;
                        }
                    }
                }
                if (to.Pattern.SImperative) {
                    for (let shape of to.Pattern.Imperative) {
                        if (!Array.isArray(shape)) shape = [shape];
                        for (let s of shape) {
                            if (s.includes(input)) return n;
                        }
                    }
                }
                for (let shape of to.Pattern.Infinitive) {
                    if (shape.includes(input)) return n;
                }
            }
        }
        return null;
    }

    searchWordAdjective(input) {
        for (const n of this.Adjectives) {
            let z = n.IsStringThisWord(input);
            //			console.log(z);
            if (z !== null) return z;
        }
        return null;
    }

    searchWordNumber(input) {
        for (const n of this.Numbers) {
            let z = n.IsStringThisWord(input);
            if (z !== null) return z;
        }
        return null;
    }

    searchWordPhrase(input) {
        for (const n of this.Phrases) {
            if (n.input == input) return n;
        }
        return null;
    }

    searchWordVerb(input) {
        for (const n of this.Verbs) {
            let z = n.IsStringThisWord(input);
            if (z !== null) return z;
        }
        return null;
    }

    searchWordPronoun(input) {
        for (const n of this.Pronouns) {
            let z = n.IsStringThisWord(input);
            if (z !== null) return z;
        }
        return null;
    }

    searchWordPreposition(input) {
        for (const n of this.Prepositions) {
            let z = n.IsStringThisWord(input);
            if (z !== null) return z;
        }
        return null;
    }

    searchSimpleWord(input) {
        for (const n of this.SimpleWords) {
            if (Array.isArray(n.input)) {
                for (const w of n.input) {
                    if (w == input) return n;
                }
            } else if (n.input == input) return n;
        }
        return null;
    }

    searchWordInterjection(input) {
        for (const n of this.Interjections) {
            if (Array.isArray(n.input)) {
                for (const m of n.input) {
                    if (m == input) return n;
                }
            } else if (n.input == input) return n;
        }
        return null;
    }

    searchWordConjunction(input) {
        for (const n of this.Conjunctions) {
            if (Array.isArray(n.input)) {
                for (const m of n.input) {
                    if (m == input) return n;
                }
            } else if (n.input == input) return n;
        }
        return null;
    }

    searchWordParticle(input) {
        for (const n of this.Particles) {
            if (Array.isArray(n.input)) {
                for (const m of n.input) {
                    if (m == input) return n;
                }
            } else {
                if (n.input == input) return n;
            }
        }
        return null;
    }

    searchWordAdverb(input) {
        for (const n of this.Adverbs) {
            if (Array.isArray(n.input)) {
                for (const m of n.input) {
                    if (m == input) return n;
                }
            } else {
                if (n.input == input) return n;
            }
        }
        return null;
    }

    SolveSentencePattern(input) {
        let opInp;

        for (const pattern of this.SentencePatterns) {
            //console.log("Try pattern: |"+input+"|", pattern);
            let isNot = false;
            // Je to on?			
            // zapadá? ["Dal jsi to ", ["vedoucímu", rules, 0], ", ten ", ["spis", rules, 1], "?"];
            let prevWasRule;
            let rawRules = [];
            opInp = input.slice();

            for (let part of pattern.input) {
                //	console.log("pattern sentence", part, typeof part);
                if (typeof part === 'string') {
                    //	console.log("Detected string", part);
                    /*if (prevWasRule){
                    	
                    	prevWasRule=false;
                    	let indexOfNext=opInp.indexOf(part);
                    	if (indexOfNext==-1) {
                    		// End
                    		isNot=true;
                    		break;
                    	}
                    	console.log("X1_2");
                    	if (opInp.includes(' ')){
                    		let indexOfNextSpace=opInp.indexOf(" ");
                    		console.log("X1_3");
                    		// After rule unknown word
                    		if (indexOfNextSpace+1!=indexOfNext ) {
                    			console.log("X1_35",indexOfNextSpace, indexOfNext,"|"+ opInp+"|", part);
                    			isNot=true;
                    			break;
                    		}
                    	}
                    	console.log("X1_4");
                    	let rawRule=opInp.substring(0,indexOfNext)
                    	console.log("X1_5","|"+ opInp+"|", part);
                    	rawRules.push(rawRule);

                    	opInp=opInp.substring(indexOfNext);
                    }*/
                    if (opInp.startsWith(part)) { //console.log("X2");
                        opInp = opInp.substring(part.length);
                        continue;
                    } else {
                        isNot = true;
                        break;
                    }
                } else {
                    //console.log("Detected rule", part);
                    //					console.log("opInp"+opInp);
                    let endOfRule = -1;
                    if (opInp.includes(' ')) {
                        endOfRule = opInp.indexOf(" ");
                        //console.log("space", endOfRule);
                    } else if (opInp.includes('.')) {
                        endOfRule = opInp.indexOf(".");
                        //console.log("dot ",endOfRule);
                    }
                    let rawRule = opInp.substring(0, endOfRule);
                    rawRules.push(rawRule);
                    opInp = opInp.substring(endOfRule);
                    //console.log("rawRule",rawRule);
                    //console.log("opInp",opInp);

                    //	prevWasRule=true;
                    continue;
                }
            }
            if (isNot) continue;


            if (dev) console.log("Found pattern for sentence: ", input, pattern);
            opInp = input;

            // ["originální slovo", "přeloženo?",  pattern.rules]
            let linkedRules = [];
            for (let rule of rawRules) {
                let p = null;
                for (let part of pattern.input) {
                    if (typeof part !== 'string') {
                        p = part;
                        break;
                    }
                }

                linkedRules.push([rule, null, null, p]);
            }
            if (dev) console.log("Created linked rules: ", linkedRules);

            // Find translate
            for (let i = 0; i < linkedRules.length; i++) {
                let link = linkedRules[i];
                let originalWord = link[0];
                let rule = link[3];
                if (rule.FallSameAsId == -1 && rule.GenderSameAsId == -1 && rule.GramaticalNumberSameAsId == -1) {
                    switch (rule.PartOfspeech) {
                        case 1:
                            {
                                //console.log(rule.FallSameAsId==-1 , rule.GenderSameAsId==-1 , rule.GramaticalNumberSameAsId==-1);
                                let z = this.searchWordNoun(originalWord.toLowerCase());
                                //console.log("searchWordNoun",originalWord, z, link);
                                if (z !== null) {
                                    linkedRules[i][2] = z;
                                    console.log("searchWordNoun XXX", z);
                                    //console.log(z);
                                    //[ret, this.PatternTo.Gender, this];
                                    let obj = z.Object;
                                    linkedRules[i][1] = obj.GetWordTo(rule.Number, rule.Fall);
                                } else {
                                    //	console.log("searchWordNoun");
                                }
                                break;
                            }

                        case 2:
                            {
                                let z = this.searchWordAdjective(originalWord, rule.Number, rule.Fall, rule.Gender);
                                //console.log("searchWordAdjective",originalWord, z, link);
                                if (z !== null) {
                                    linkedRules[i][1] = z;
                                    linkedRules[i][1] = z.GetWordTo(rule.Number, rule.Fall);
                                }
                                break;
                            }
                    }
                }
            }
            if (dev) console.log("Translated linked rules: ", linkedRules);

            // Solve big letters
            let r = 0;
            let first = true;
            for (let out of pattern.output) {
                if (typeof out === 'string') {
                    first = false;
                } else {
                    let final = linkedRules[r][1];
                    if (final == null) {
                        cancel = true;
                        if (dev) console.log("Nepovedlo se detekování slova ve větě", pattern.output, linkedRules[r]);
                        break;
                    }
                    if (first) {
                        //	console.log("TTTT",this.MakeFirstLetterBig(final));
                        linkedRules[r][1] = this.MakeFirstLetterBig(final);
                        first = false;
                        r++;
                        continue;
                    } else {
                        r++;
                    }
                }
            }

            // Print
            r = 0;
            let cancel = false;
            let ele = document.createElement("span");
            for (let out of pattern.output) {
                if (typeof out === 'string') {
                    this.AddText(out);
                } else {
                    let final = linkedRules[r][1];
                    if (final == null) {
                        cancel = true;
                        if (dev) console.log("Nepovedlo se detekování slova ve větě", pattern.output, linkedRules[r]);
                        break;
                    }
                    this.AddText(final);
                    r++;
                }
            }
            if (!cancel) return ele;
        }
        return null;
    }

    MakeFirstLetterBig(string) {
        if (typeof string === 'string') return string.charAt(0).toUpperCase() + string.slice(1);
        if (Array.isArray(string)) {
            let arr = [];
            for (let str of string) {
                arr.push(str.charAt(0).toUpperCase() + str.slice(1));
            }
            return arr;
        }
        throw Exception("Prameter 'string' in MakeFirstLetterBig(string) has unknown typeof");
    }

    SearchInputNounWord(stringNoun, number, fall) {
        for (let i = 0; i < Nouns.length; i++) {
            let noun = Nouns[i];
            if (noun.From != "") {
                if (stringNoun.startsWith(noun.input)) {
                    let z = noun.GetWordFrom(number, fall);
                    if (z !== null) return noun;
                }
            } else {
                let z = noun.GetWordFrom(number, fall);
                if (z !== null) return noun;
            }
        }
        return null;
    }

    SearchInputNounWord(stringNoun, number, fall, gender) {
        for (let noun of this.Nouns) {
            console.log(noun);
            if (noun.From != "") {
                if (stringNoun.startsWith(noun.From)) {
                    let z = noun.GetWordFrom(number, fall, gender);
                    if (z !== null) return [noun, number];
                }
            } else {
                let z = noun.GetWordFrom(number, fall, gender);
                if (z !== null) return [noun, number];
            }
        }
        return null;
    }

    AddText(x) {
        if (typeof x === "string") {
            return ApplyPostRules(x);
        }
        if (Array.isArray(x)) {
            return ApplyPostRules(x[0]);
        }
    }

    PrepareText(x) {
        if (typeof x === "string") {
            return x;
        }
        if (Array.isArray(x)) {
            let earr = [];
            // Remove more info
            for (let i of x) {
                if (Array.isArray(i)) {
                    if (Array.isArray(i.Text)) {
                        for (let a of i.Text) earr.push(a);
                    } else earr.push(i.Text);
                } else {
                    if (typeof i == 'object') earr.push(i.Text);
                    else earr.push(i);
                }
            }

            // Remove dup
            let sarr = [];
            for (let a of earr) {
                let exists = false;

                for (let s of sarr) {
                    if (s == a) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    sarr.push(a);
                }
            }

            if (sarr.length == 1) {
                return sarr[0];
            }

            return sarr;
        }
        return "";
    }

    AddTextOne(string, parentElement, className) {
        let span = document.createElement("span");
        span.innerText = ApplyPostRules(string);
        if (styleOutput) span.className = className;
        parentElement.appendChild(span);      
    }

    AddTextMultiple(variants, parentElement, className) {
        //if (this.html){
        let pack = document.createElement("span");
        pack.className = "traMOp";

        let span = document.createElement("span");
        span.style = "text-decoration: underline dotted; cursor: pointer;";
        if (styleOutput) span.className = className;

        let box = document.createElement("ul");
        box.style = "opacity: 0";
        box.setAttribute("canHide", false);
        box.style.display = "none";
        box.className = "pop";
        let selectedIndex = 0;
        for (let i = 0; i < variants.length; i++) {
            let tag = document.createElement("li");
            tag.style = "cursor: pointer;";
            tag.innerText = ApplyPostRules(variants[i]);
            tag.addEventListener('click', function() {
                selectedIndex = i;
                span.innerText = ApplyPostRules(variants[i]);
                box.style.opacity = "0";
                box.style.display = "none";
                box.setAttribute("canHide", false);
                setTimeout(function() { box.style.display = 'none'; }, 100);
            });
            box.appendChild(tag);
        }

        span.addEventListener('click', function() {
            if (box.style.opacity == "1") {
                box.style.opacity = "0";
                setTimeout(function() { box.style.display = 'none'; }, 100);
            } else {
                box.style.display = 'block';
                box.style.opacity = "1";
                box.setAttribute("canHide", false);
                setTimeout(function() { box.setAttribute("canHide", true); }, 100);
            }
        });

        window.addEventListener('click', function(e) {
            if (!box.contains(e.target)) {
                if (!span.contains(e.target)) {
                    if (box.style.opacity == "1") {
                        if (box.getAttribute("canHide")) {
                            box.style.opacity = "0";
                            setTimeout(function() {
                                if (box.getAttribute("canHide")) {
                                    box.style.display = 'none';
                                    box.setAttribute("canHide", false);
                                }
                            }, 100);
                        }
                    }
                }
            }
        });

        span.innerText = ApplyPostRules(variants[selectedIndex]);

        pack.appendChild(span);
        pack.appendChild(box);
        parentElement.appendChild(pack);

        idPops++;
        //}else{
        //	parentElement+=ApplyPostRules(variants[0]);
        //}
    }

    MultipleSplit(string, separators) {
        let arr = [];
        let word = "";
        let isSeparator;

        for (const ch of string) {
            isSeparator = false;

            // Is current char separator
            for (const s of separators) {
                if (s == ch) {
                    isSeparator = true;
                    if (word != "") {
                        arr.push([true, word]);
                        word = "";
                    }
                    arr.push([false, s]);
                    break;
                }
            }

            if (!isSeparator) {
                word += ch;
            }
        }
        if (!isSeparator) {
            if (word != "") arr.push([true, word]);
        }
        // for example [["true", "He"], [false, " "], [true, "is"], [false, " "], [true, "guy"], [false, "!"]]
        return arr;
    }

    SplitSentences(string, separators) {
        let arr = [];
        let sentence = "";
        let isSeparator;

        for (const ch of string) {
            isSeparator = false;
            //	let separator;

            // Is current char separator
            for (const s of separators) {
                if (s == ch) {
                    isSeparator = true;
                    if (sentence != "") {
                        sentence += ch;
                        arr.push(sentence.trim());
                        sentence = "";
                    }
                    //	arr.push([false, s]);
                    break;
                }
            }

            if (!isSeparator) {
                sentence += ch;
            }
        }
        if (!isSeparator) {
            if (sentence != "") arr.push(sentence.trim());
        }
        //console.log(arr);
        // for example [["true", "He"], [false, " "], [true, "is"], [false, " "], [true, "guy"], [false, "!"]]
        return arr;
    }

    SplitStringTags(string, separators, ignoreTags) {
        const tagStart= "<", tagEnd=">";
        let arr=[];
        let workingString=string;

        while (workingString.length>0) {
            // Closes separator to start
            let sMin=-1;
            for (let s of separators) {
                let sPos=workingString.indexOf(s);
                if (sPos<sMin && sPos>=0) {
                    sMin=sPos;
                }
            }

            // tag
            if (ignoreTags) {
                let tagStartPos=workingString.indexOf(tagStart);

                if (tagStartPos<=sMin || sMin<0) {
                    let toEnd=workingString.substring(tagStartPos);
                    let endTagPos=toEnd.indexOf(tagEnd);
                    if (endTagPos>0) {
                        let beforeStr=workingString.substring(0, tagStartPos);
                        // before tag
                        if (beforeStr!="") arr.push({String: beforeStr, Tag: false});

                        // tag
                        arr.push({String: toEnd.substring(0, endTagPos+1), Tag: true});
                        workingString=workingString.substring(tagStartPos+endTagPos+1);
                        continue;
                    }       
                }
            }

            // part
            if (sMin>=0) {
                let partPos=toEnd.indexOf(sMin);
                console.log(partPos);
                if (partPos>=0) {
                    arr.push({String: workingString.substring(0, partPos), Tag: false});
                    workingString=workingString.substring(partPos);
                    continue;
                }

            // Finishing...
            } else {
                arr.push({String: workingString, Tag: false});
                break;
            }
        }
        console.log(arr);
        return arr;
    }

    ReplaceWord(str) {
        // Find best starting
        let bestStart = null;
        let bestStartlen = 0;

        for (let s of this.ReplaceS) {
            if (str.startsWith(s.input)) {
                /*if (s.input.length<str.length) {
                	if (bestStart==null) bestStart=s;
                	else if (bestStart.output.length<s.input.length) {
                		bestStart=s;
                	}
                }*/
                if (bestStartlen < s.input.length) {
                    //	if (bestStart==null) bestStart=s;
                    //else if (bestStart.output.length<s.input.length) {
                    bestStart = s;
                    bestStartlen = s.input.length;
                    //}s.input.length
                }
            }
        }

        // Find best ending
        let bestEnd = null;
        let maxEndLen = str.length - ((bestStart == null) ? 0 : bestStart.output.length);
        let bestEndLen = 0;
        for (let e of this.ReplaceE) {
            if (str.endsWith(e.input)) {
                if (e.output.length <= maxEndLen) {
                    if (bestEndLen < e.input.length) {
                        bestEnd = e;
                        bestEndLen = e.length;
                    }
                }
            }
        }

        let endLen = ((bestEnd == null) ? 0 : bestEnd.input.length);

        // no inside
        if (str.length - endLen - bestStartlen == 0) return bestStart ? bestStart.output : "" + bestEnd ? bestEnd.output : "";
        // Center replace (not multiple again and again)
        let inside = str.substring(bestStartlen, str.length - endLen);
        //console.log(inside);
        let PatternAlrearyReplaced = [];
        for (let i = 0; i <= inside.length; i++) {
            PatternAlrearyReplaced.push("o");
        }
        let ret = inside;
        for (let g of this.ReplaceG) {
            if (inside.includes(g.input)) {
                // No overlap replaces
                let startOfReplace = inside.indexOf(g.input);
                //console.log(g.input);	
                //console.log(ret,PatternAlrearyReplaced);

                let doReplace = true;
                for (let i = startOfReplace; i < g.input.length; i++) {
                    if (PatternAlrearyReplaced[i] != "o") {
                        doReplace = false;
                        break;
                    }
                }

                if (doReplace) {
                    ret = ret.replace(g.input, g.output);

                    for (let i = startOfReplace; i < g.input.length; i++) {
                        PatternAlrearyReplaced[i] = "x";
                    }
                }
            }
        }

        if (bestStart == null && bestEnd == null) return ret;

        // starting only
        if (bestStart == null) {
            if (Array.isArray(bestEnd.output)) {
                let arr = [];
                for (let e of bestEnd.output) {
                    arr.push(ret + e);
                }
                console.log(arr);
                return arr;
            } else return ret + bestEnd.output;
        }

        // ending only
        if (bestEnd == null) {
            if (Array.isArray(bestStart.output)) {
                let arr = [];
                for (let s of bestEnd.output) {
                    arr.push(s + ret);
                }
                console.log(arr);
                return arr;
            } else return bestStart.output + ret;
        }

        // non null
        if (Array.isArray(bestStart.output)) {
            let arr = [];
            for (let s of bestStart.output) {
                if (Array.isArray(bestEnd.output)) {
                    for (let e of bestEnd.output) {
                        arr.push(ret + e);
                    }
                } else return s + ret + bestEnd.output;
            }
            console.log(arr);
            return arr;
        } else {
            let arr = [];
            if (Array.isArray(bestEnd.output)) {
                for (let e of bestEnd.output) {
                    arr.push(bestStart.output + ret + e);
                }
            } else return bestStart.output + ret + bestEnd.output;
            console.log(arr);

            return arr;
        }

        //return ((bestStart!=null) ?bestStart.output:"")+ret+((bestEnd!=null) ? bestEnd.output:"");
    }

    ApplyPhrases(arrOfWords, start) {
        for (const phrase of this.Phrases) {
            for (const variantPhrase of phrase.input) {

                //console.log("Phrase",variantPhrase);
                if (MatchArrayInArray(arrOfWords, start, variantPhrase)) {
                    //let output=phrase.output;
                    //if (Array.isArray(phrase.output)) output=phrase.output[0];
                    let ret = ApplyMatch(arrOfWords, start, start + variantPhrase.length, phrase.output);
                    /*if (ret!=null)*/
                    return ret;
                }
            }
        }
        return null;

        function ApplyMatch(arrSource, startIndex, endIndex, arrToSet) {
            // Verob puvodni string
            let str = "";
            for (let w = startIndex; w < endIndex; w++) {
                //				console.log(arrSource,w);
                str += arrSource[w][1];
            }

            // Přidé za staré pola puvodni
            arrSource.splice(startIndex, endIndex - startIndex - 1);

            return { Type: "Phrase", To: arrToSet, From: str };
        }

        function MatchArrayInArray(arrSource, startIndex, arrToMatch) {
            if (arrToMatch == undefined) return false;
            //if (startIndex==0)console.log("MatchArrayInArray", arrSource, startIndex,arrToMatch);
            //if (arrSource[0]==arrToMatch[0])console.log("bene");
            if (arrSource.length - startIndex < arrToMatch.length) return false;
            for (let i = 0; i + startIndex < arrSource.length && i < arrToMatch.length; i++) {
                if (arrSource[startIndex + i][1] /*.toLowerCase()*/ !== arrToMatch[i]) return false;
            }

            return true;
        }
    }

    /*BuildSelect(rawStr) {
        if (rawStr == "") return [];

        let arr = [];
        for (const selector of rawStr.split('#')) {
            let sel = new Selector();
            let parts = selector.split('|');
            sel.name = parts[0];

            for (let i = 1; i < parts.length; i++) {
                let o = parts[i].split(">");
                arr.push([o[0], o[1].split(",")]);
            }
            this.SelectReplace = sel.Replaces = arr;
        }
    }*/

    // přeložit text s daným slovem, které má speciální vlatnosti
    CustomWord(str) {
        //console.log(str);
        const starting = "<{",
            ending = "}>";
        if (str.startsWith(starting) && str.endsWith(ending)) {
            //let listOfItems;
            let body = str.substring(starting.length, str.length - starting.length);
            //	console.log(body);
            //console.log(vars);

            let rules = {};
            let vars = body.split('|');
            for (const p of vars) {
                let rule = p.split("=");
                if (rule.length == 2) {
                    rules[rule[0]] = rule[1];
                } else rules[rule[0]]=true;//return { Type: "Unknown", To: word, From: str };
            }

            if (rules["word"] != undefined) {
                let word = rules["word"];
                switch (rules["typ"]) {
                    case "pods": // <{word=den|typ=pods|cislo=j|pad=1}>  							
                        {
                            if (rules["cislo"] != undefined && rules["pad"] != undefined) {
                                let cislo = -1,
                                    pad = -1;
                                if (rules["cislo"] == "j") cislo = 1;
                                else if (rules["cislo"] == "m") cislo = 2;
                                else cislo = parseInt(rules["cislo"]);

                                pad = parseInt(rules["pad"]);

                                let words = this.searchWordNoun(word);
                                //	console.log("!!!!!!", words);
                                if (words != null) {
                                    for (let w of words.Shapes) {
                                        //	console.log("vars", w,cislo,pad);
                                        //if (w[1]==cislo && w[2]==pad) {
                                        if (w.Number == cislo && w.Fall == pad) {
                                            //	console.log("OK");
                                            return { Type: "Noun", To: { Shapes: [w], Gender: words.Gender, Object: words.Object }, From: word };
                                            //["Noun", n, původní]
                                        }
                                    }
                                }
                            }
                            /*	for (const v of vars) {
                            		let nrule=v.split("=");
                            		console.log(nrule[0]);
                            		if (nrule[0]=="cislo") {
                            			if (nrule[1]=="j") cislo=1;
                            			else if (nrule[1]=="m") cislo=2;
                            			else cislo=nrule[1];
                            			break;
                            		}
                            	}
                            	for (const v of vars) {
                            		let nrule=v.split("=");
                            	//	console.log(nrule);
                            		if (nrule[0]=="pad") {
                            			pad=parseInt(nrule[1]);
                            			break;
                            		}
                            	}*/


                        }
                        break;

                    case "prid":
                        {
                            let cislo, pad, rod;
                            if (rules["cislo"] != undefined) {
                                if (rules["cislo"] == "m") cislo = 2;
                                else if (rules["cislo"] == "j") cislo = 1;
                                else cislo = parseInt(rules["cislo"]);
                            }

                            if (rules["pad"] != undefined) {
                                pad = parseInt(rules["pad"]);
                            }

                            if (rules["rod"] != undefined) {
                                switch (rules["rod"]) {
                                    case "mz":
                                        rod = "MasculineAnimate";
                                        break;

                                    case "mn":
                                        rod = "MasculineInanimate";
                                        break;

                                    case "z":
                                        rod = "Feminine";
                                        break;

                                    case "s":
                                        rod = "Neuter";
                                        break;
                                }
                            }

                            let words = this.searchWordAdjective(word);
                            //console.log(words);
                            if (words != null) {
                                for (let w of words) {
                                    if (w.Number == cislo && w.Fall == pad && w.Gender == rod) {
                                        //console.log(w, w.Number==cislo && w.Fall==pad && w.Gender==rod, w.Number==cislo, w.Fall==pad, w.Gender==rod);
                                        return { Type: "Adjective", To: [w], From: word };
                                        //BuildingSentence.push({Type: "Adjective", To: n, From: Zword});
                                        //ret.push({Text: to.Body+shapeTo, Number: start==0?1:2, Fall: i+1-start, Gender: gender});
                                    }
                                }
                            }
                        }
                        break;

                    case "zajm":
                        {
                            let cislo = -1,
                                pad = -1,
                                rod = "";

                            if (rules["cislo"] != undefined) {
                                if (rules["cislo"] == "m") cislo = 2;
                                else if (rules["cislo"] == "j") cislo = 1;
                                else cislo = parseInt(rules["cislo"]);
                            }
                            if (rules["pad"] != undefined) {
                                pad = parseInt(rules["pad"]);
                            }
                            if (rules["rod"] != undefined) {
                                switch (rules["rod"]) {
                                    case "mz":
                                        rod = "mz";
                                        break;

                                    case "mn":
                                        rod = "mn";
                                        break;

                                    case "z":
                                        rod = "z";
                                        break;

                                    case "s":
                                        rod = "s";
                                        break;
                                }
                            }

                            let words = this.searchWordPronoun(word);
                            if (words != null) {
                                for (const w of words.Shapes) {
                                    if ((w.Number == cislo || cislo == -1) && (w.Fall == pad || pad == -1) && (w.Gender == rod || rod == "")) {
                                        //console.log(w,(w.Number==cislo || cislo==-1) , (w.Fall==pad || pad==-1), (w.Gender==rod || rod==""));
                                        return { Type: "Pronoun", To: [w], From: word };
                                    }
                                }
                            }
                        }
                        break;

                    case "cisl":
                        {
                            let cislo = -1,
                                pad = -1,
                                rod = "";
                            for (const nrule of vars) {
                                if (nrule[0] == "cislo") {
                                    cislo = nrule[1];
                                    break;
                                }
                            }
                            for (const nrule of vars) {
                                if (nrule[0] == "pad") {
                                    pad = nrule[1];
                                    break;
                                }
                            }
                            for (const nrule of vars) {
                                if (nrule[0] == "rod") {
                                    rod = nrule[1];
                                    break;
                                }
                            }

                            let words = this.searchWordNumber(word);
                            for (let w of words[0]) {
                                if ((cislo == -1 || w[1] == cislo) && (pad == -1 || w[1] == pad) && (rod == "" || w[1] == rod)) {
                                    return { Type: "Number", To: w, From: word };
                                }
                            }
                        }
                        break;

                    case "verb":
                        {
                            let cislo = -1,
                                osoba = -1,
                                cas = "";
                            for (const nrule of vars) {
                                if (nrule[0] == "cislo") {
                                    cislo = nrule[1];
                                    break;
                                }
                            }
                            for (const nrule of vars) {
                                if (nrule[0] == "o") {
                                    osoba = nrule[1];
                                    break;
                                }
                            }
                            for (const nrule of vars) {
                                if (nrule[0] == "cas") {
                                    cas = nrule[1];
                                    break;
                                }
                            }

                            let words = this.searchWordVerb(word);
                            for (let w of words[0]) {
                                if (w[1] == osoba && w[2] == pad && w[3] == cas) {
                                    return { Type: "Verb", To: w, From: word };
                                }
                            }
                        }
                        break;
                }
            } else if (rules["exists"] != undefined) {
                //<{exists=ł}>
                let ch = rules["exists"];
                if (this.Stats() > 0) {
                    let words = this.searchExists(ch);
                    if (words != null) return { Type: "Check", To: "1", From: ch };
                    else return { Type: "Check", To: "0", From: ch };
                } else return { Type: "Unknown", To: "?", From: ch };
            }else if (rules["quality"] != undefined) {
                let q=this.Stats();
                return { Type: "Special", To: q.toString(), From: "quality" };
            }else if (rules["finished"] != undefined) {
                let q=this.Finished();
                return { Type: "Special", To: q.toString(), From: "finished" };
            }else if (rules["source"] != undefined) {
                let q=this.Comment.includes(rules["source"]);                
                return { Type: "Special", To: q ? "1" : "0", From: "source" };
            }else if (rules["name"] != undefined) {
                if (this.Names!=undefined) {
                    console.log("name");
                    let ch = rules["name"];
                    let n=this.Names[ch];
                    return { Type: "Special", To: n, From: "name" };
                }else return { Type: "Unknown", To: "?", From: "name" };
            }

            return { Type: "Unknown", To: "?", From: str };
        }
    }
}

function ApplyPostRules(text) {
    //	let ret=text;
    if (typeof text === "string") return ApplyTranscription(text);
    return "";
}

function FastLoadTranslateToWithPattern(rawData, indexStart, t) {
    let ret = [];
    
    /*if (loadedVersionNumber <=2) {
        for (let i = indexStart; i < rawData.length; i += 3) {
            let rawBody = rawData[i],
                rawPattern = rawData[i + 1];

            if (rawBody.includes('?')) continue;
            if (rawPattern.includes('?')) continue;

            let patern = t.GetPatternByNameTo(rawPattern);
            if (patern == null) { if (dev) console.log("Couldn't find pattern " + rawPattern); continue; }

            let comment = rawData[i + 2];
            if (comment == "") ret.push({ Body: rawData[i], Pattern: patern });
            else ret.push({ Body: rawData[i], Pattern: patern, Comment: comment });
        }
    } else if (loadedVersionNumber == 3) {*/
        for (let i = indexStart; i < rawData.length; i += 4) {
            let rawBody = rawData[i],
                rawPattern = rawData[i + 1];

            //console.log(rawData,i)

            if (rawBody.includes('?')) continue;
            if (rawPattern.includes('?')) continue;

            let patern = t.GetPatternByNameTo(rawPattern);
            if (patern == null) { if (dev) console.log("Couldn't find pattern " + rawPattern); continue; }

            let comment = rawData[i + 2];
            //if (comment == "") ret.push({ Body: rawData[i], Pattern: patern });
            //else 
            ret.push({ Body: rawData[i], Pattern: patern, Comment: comment, Source: rawData[i + 3] });
        }
    //}

    if (ret.length == 0) {
        if (dev) console.log("Cannot load pattern '" + rawData + "'");
        return null;
    }

    return ret;
}

function FastLoadTranslateTo(rawData, indexStart) {
    let ret = [];
    for (let i = indexStart; i < rawData.length; i += 3) {
        //	console.log(i);
        let rawText = rawData[i];

        if (rawText == '') continue;
        if (rawText.includes('?')) continue;

        ret.push({ Text: rawText, Comment: rawData[i + 1], Source: rawData[i + 2] });
    }

    if (ret.length == 0) {
        if (dev) console.log("Cannot load pattern '" + rawData + "'");
        return null;
    }

    return ret;
}

function ApplyTranscription(str) {
    //	console.log("transcription: ", transcription);
    if (transcription == null) return str;
    //	console.log("before: ", str);

    let PatternAlrearyReplaced = [];
    for (let i = 0; i <= str.length; i++) {
        PatternAlrearyReplaced.push("o");
    }

    let ret = str;
    for (let g of transcription) {
        if (ret.type == "end") {
            if (ret.endsWith(g.from)) {
                let startOfReplace = str.lastIndexOf(g.from);

                // Pokuď néni obsazene
                let doReplace = true;
                for (let i = startOfReplace; i < g.from.length; i++) {
                    if (PatternAlrearyReplaced[i] != "o") {
                        doReplace = false;
                        break;
                    }
                }

                if (doReplace) {
                    ret = ret.substring(0, str.length - g.from.length) + g.to;

                    for (let i = startOfReplace; i < g.from.length; i++) {
                        PatternAlrearyReplaced[i] = "x";
                    }
                }
            }
        } else {
            let ind = -1;
            for (let i = 0; i < 10; i++) {
                //if (g.from=="ṵ" && ret.includes(g.from)) console.log("g.from", g, ret, ret.includes(g.from),PatternAlrearyReplaced);
                if (ret.includes(g.from)) {
                    let startOfReplace;
                    if (ind > 0) {
                        startOfReplace = str.substring(0, ind + g.from.length).indexOf(g.from) + g.from.length;
                    } else startOfReplace = str.indexOf(g.from);
                    ind = startOfReplace;

                    // Pokaď néni obsazene
                    let doReplace = true;
                    //  console.log("g.from", g.from, g);
                    for (let i = startOfReplace; i < g.from.length; i++) {
                        if (PatternAlrearyReplaced[i] != "o") {
                            doReplace = false;
                            break;
                        }
                    }

                    if (doReplace) {
                        ret = ret.replace(g.from, g.to);

                        for (let i = startOfReplace; i < g.from.length; i++) {
                            PatternAlrearyReplaced[i] = "x";
                        }
                    } else break;
                } else break;
            }
        }
    }

    //	console.log("Replaced: ", ret);
    return ret;
}

function LoadArr(rawArr, len, start) {
    let arr = [];
    for (let i = start; i < len + start && i < rawArr.length; i++) {
        let rawShape = rawArr[i];
        //console.log(rawShape);
        if (!rawShape.includes(",")) {
            // Uncompress
            if (rawShape.startsWith("?×")) {
                let cntRaw = rawShape.substring(2);
                let cnt = parseInt(cntRaw);
                for (let j = 0; j < cnt; j++) arr.push("?");
                //i+=cnt;
                continue;
            } else if (rawShape.startsWith("-×")) {
                let cntRaw = rawShape.substring(2);
                let cnt = parseInt(cntRaw);
                for (let j = 0; j < cnt; j++) arr.push("-");
                //i+=cnt;
                continue;
            }
        }

        arr.push(rawShape.split(','));
    }
    //console.log(arr);
    return arr;
}

function isNumber(num) {
    return !isNaN(num);
}

function base64ToNum(code) {
    let num=0;
    for (let i=0; i<code.length; i++) {
        let n=GetNumBase64(code[i]);
        num += (n << 6*(code.length-1-i));
    }
    return num;
    
    function GetNumBase64(ch) {
        switch (ch) {
            case 'A': return 0;
            case 'B': return 1;
            case 'C': return 2;
            case 'D': return 3;
            case 'E': return 4;
            case 'F': return 5;
            case 'G': return 6;
            case 'H': return 7;
            case 'I': return 8;
            case 'J': return 9;
            case 'K': return 10;
            case 'L': return 11;
            case 'M': return 12;
            case 'N': return 13;
            case 'O': return 14;
            case 'P': return 15;
            case 'Q': return 16;
            case 'R': return 17;
            case 'S': return 18;
            case 'T': return 19;
            case 'U': return 20;
            case 'V': return 21;
            case 'W': return 22;
            case 'X': return 23;
            case 'Y': return 24;
            case 'Z': return 25;
            case 'a': return 26;
            case 'b': return 27;
            case 'c': return 28;
            case 'd': return 29;
            case 'e': return 30;
            case 'f': return 31;
            case 'g': return 32;
            case 'h': return 33;
            case 'i': return 34;
            case 'j': return 35;
            case 'k': return 36;
            case 'l': return 37;
            case 'm': return 38;
            case 'n': return 39;
            case 'o': return 40;
            case 'p': return 41;
            case 'q': return 42;
            case 'r': return 43;
            case 's': return 44;
            case 't': return 45;
            case 'u': return 46;
            case 'v': return 47;
            case 'w': return 48;
            case 'x': return 49;
            case 'y': return 50;
            case 'z': return 51;
            case '0': return 52;
            case '1': return 53;
            case '2': return 54;
            case '3': return 55;
            case '4': return 56;
            case '5': return 57;
            case '6': return 58;
            case '7': return 59;
            case '8': return 60;
            case '9': return 61;
            case '+': return 62;
            case '/': return 63;
            //#$%&()*,.:;<=>?@[]^_`{}~"'
        }
        return '_';
    }
}

function LoadDataLineString(line, shortcuts) {
    if (line.startsWith('!')) {
        let base64_id=line.substring(1);
        let id=base64ToNum(base64_id);
        if (id>=shortcuts.length) console.error(id+" is to big", shortcuts, line);        
        let sh=shortcuts[id];
        return sh.data;        
    } else return line;
}

function LoadDataLinePattern(line, shortcuts) {
    if (line.includes('|')) return line;

    let parts=line.split('!');
    if (parts.length==2){
        let base64_id=parts[1];
        let id=base64ToNum(base64_id);
        if (id>=shortcuts.length) {
            console.warn(id+" is to big", shortcuts, line);     
            return "";   
        }
        let sh=shortcuts[id];
        return parts[0]+'|'+sh.data;        
    } else return line;
}
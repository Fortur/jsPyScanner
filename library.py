def lib_register_result(base64_image, result):
  '''
    Registeres verified recognition result for processing
    further (in this sample - simply saving in a JSON file)
  '''

  import json

  decoded_result = json.loads(result)
  decoded_result['image'] = base64_image

  with open('saved_result.json', 'w', encoding = 'utf8') as stream:
    stream.write(json.dumps(decoded_result, ensure_ascii = False, indent = 2))



def lib_process_image(base64_image):
  '''
    Processes the input image, returns JSON with
    processing result, including document recognition
    and layout analysis. JSON format:
    {
      "document_type": "<DOCTYPENAME>",
      "document_geometry": {
        "templates": {
          "<TEMPLATENAME>": {
            "template_quad": [
              [ <X>, <Y> ], ... (4 points)
            ]
          },
          ... (other templates)
        }
      },
      "fields": {
        "<FIELDNAME>": {
          "value": "<FIELDVALUE>",
          "is_rejected": <BOOLEAN>,
          "confidence": <CONFIDENCE>,
        },
        ... (other fields)
      }
    }
  '''

  # Here some magic happens with the image

  return '''
{
  "document_type": "rus.passport.national",
  "document_geometry": {
    "templates": {
      "rus.passport.national:page2": {
        "template_quad": [
          [
            424.18752856723506284,
            97.798629190837829128
          ],
          [
            1914.9736393316791236,
            362.19802096813782555
          ],
          [
            1747.2252842217474154,
            1400.2140568437673664
          ],
          [
            226.10402966921768098,
            1125.3783133900678877
          ]
        ]
      },
      "rus.passport.national:page3": {
        "template_quad": [
          [
            268.54155805149702019,
            1137.9132791855627147
          ],
          [
            1744.9251345553914234,
            1376.135553402800042
          ],
          [
            1569.3221524034968297,
            2461.9316001579845761
          ],
          [
            68.924402767481169008,
            2178.2662904619292021
          ]
        ]
      }
    }
  },
  "fields": {
    "authority": {
      "value": "ОТДЕЛОМ ВНУТРЕННИХ ДЕЛ ОКТЯБРЬСКОГО ОКРУГА ГОРОДА АРХАНГЕЛЬСКА",
      "is_rejected": false,
      "confidence": 0.99632060527801513672
    },
    "authority_code": {
      "value": "292-000",
      "is_rejected": false,
      "confidence": 0.99703061580657958984
    },
    "birthdate": {
      "value": "12.09.1982",
      "is_rejected": false,
      "confidence": 0.99951410293579101563
    },
    "birthplace": {
      "value": "ГОР. АРХАНГЕЛЬСК",
      "is_rejected": false,
      "confidence": 0.99380987882614135742
    },
    "full_mrz": {
      "value": "PNRUSIM8REK<<EVGENIQ<ALEKSANDROVI3<<<<<<<<<<1100000000RUS8209120M<<<<<<<4041217292000<46",
      "is_rejected": false,
      "confidence": 0.91808831691741943359
    },
    "gender": {
      "value": "МУЖ.",
      "is_rejected": false,
      "confidence": 0.9991092681884765625
    },
    "issue_date": {
      "value": "17.12.2004",
      "is_rejected": false,
      "confidence": 0.99895513057708740234
    },
    "mrz_line1": {
      "value": "PNRUSIM8REK<<EVGENIQ<ALEKSANDROVI3<<<<<<<<<<",
      "is_rejected": false,
      "confidence": 1.0
    },
    "mrz_line2": {
      "value": "1100000000RUS8209120M<<<<<<<4041217292000<46",
      "is_rejected": false,
      "confidence": 1.0
    },
    "name": {
      "value": "ЕВГЕНИЙ",
      "is_rejected": false,
      "confidence": 0.99823606014251708984
    },
    "number": {
      "value": "000000",
      "is_rejected": false,
      "confidence": 0.99089968204498291016
    },
    "number_page2": {
      "value": "000000",
      "is_rejected": false,
      "confidence": 0.99584949016571044922
    },
    "number_page3": {
      "value": "000000",
      "is_rejected": false,
      "confidence": 0.9859498143196105957
    },
    "patronymic": {
      "value": "АЛЕКСАНДРОВИЧ",
      "is_rejected": false,
      "confidence": 0.99810361862182617188
    },
    "series": {
      "value": "1104",
      "is_rejected": false,
      "confidence": 0.99868375062942504883
    },
    "series_page2": {
      "value": "1104",
      "is_rejected": false,
      "confidence": 0.99879574775695800781
    },
    "series_page3": {
      "value": "1104",
      "is_rejected": false,
      "confidence": 0.99857175350189208984
    },
    "surname": {
      "value": "ИМЯРЕК",
      "is_rejected": false,
      "confidence": 0.99832421541213989258
    }
  }
}
  '''

# Testing

if __name__ == '__main__':
  image = '...BASE64_IMAGE...'

  print('TEST: Sending image to the library...')
  res = lib_process_image(image)

  print('TEST: Modifying result...')
  import json
  decoded_res = json.loads(res)
  decoded_res['fields']['surname']['verified_value'] = 'ИВАНОВ'

  print('TEST: Registering result...')
  lib_register_result(image, json.dumps(decoded_res))

export const AggregationPipelines = {
    HourlyAverage: [{
        '$unwind': {
          'path': '$object_type_detections'
        }
      }, {
        '$group': {
          "_id": {
            "hour": {
              "$hour": {
                "$toDate": "$timestamp"
              }
            },
            "type": "$object_type_detections.type"
          },
          "avg": { "$avg": "$object_type_detections.total" },
          "sum": { "$sum": "$object_type_detections.total" },
          "count": { "$sum": 1 }
        }
      },
      { "$sort": { "_id.hour": -1, "_id.min_size_ml": 1 } }
    ],
    HourlyAverageOld: [{
        '$unwind': {
          'path': '$detection_size_distribution'
        }
      }, {
        '$group': {
          "_id": {
            "hour": {
              "$hour": {
                "$toDate": "$timestamp"
              }
            },
            "min_size_ml": "$detection_size_distribution.min_size_ml",
            "max_size_ml": "$detection_size_distribution.max_size_ml"
          },
          "avg": { "$avg": "$detection_size_distribution.amount" }
        }
      },
      { "$sort": { "_id.hour": -1, "_id.min_size_ml": 1 } }
    ],
    DetectionsByType:[
      {
          "$unwind": {
              "path": "$object_type_detections"
          }
      },
      {
          "$unwind": {
              "path": "$object_type_detections.detection_size_distribution"
          }
      },
      {
          "$group": {
              "_id": {
                  "type": "$object_type_detections.type",
                  "min_size_ml": "$object_type_detections.detection_size_distribution.min_size_ml",
                  "max_size_ml": "$object_type_detections.detection_size_distribution.max_size_ml"
              },
              "total": {
                  "$sum": "$object_type_detections.detection_size_distribution.amount"
              },
              "detection_type": {
                  "$addToSet": {
                      "$concat": [
                          {
                              "$toString": "$object_type_detections.detection_size_distribution.min_size_ml"
                          },
                          " - ",
                          {
                              "$toString": "$object_type_detections.detection_size_distribution.max_size_ml"
                          }
                      ]
                  }
              }
          }
      },
      {
          "$sort": {
              "_id.min_size_ml": 1
          }
      }
  ],
    DetectionsByTypeOld: [{
        '$unwind': {
          'path': '$detection_size_distribution'
        }
      }, {
        '$group': {
          "_id": {
            "min_size_ml": "$detection_size_distribution.min_size_ml",
            "max_size_ml": "$detection_size_distribution.max_size_ml"
          },
          "total": { "$sum": "$detection_size_distribution.amount" },
          "type": {
            $addToSet: { 
              "$concat":[
                  {"$toString": "$detection_size_distribution.min_size_ml" },
                  " - ",
                  {"$toString": "$detection_size_distribution.max_size_ml" }
                ]
            }
          }
        }
      },
      { "$sort": { "_id.min_size_ml": 1 } }
    ]
    
}
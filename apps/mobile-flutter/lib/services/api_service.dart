import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  final Dio _dio = Dio();
  final _storage = const FlutterSecureStorage();

  // Toggle Mock Mode for offline testing/demo
  static const bool _useMockMode = true;
  static const String _baseUrl = 'https://physiotherapy-backend-nextjs.vercel.app/api';

  // In-memory mock databases for session persistence
  static final List<Map<String, dynamic>> _mockAppointments = [
    {
      '_id': 'app_1',
      'status': 'confirmed',
      'date': '2026-09-10',
      'timeSlot': '10:00 AM',
      'visitType': 'clinic',
      'therapistId': {
        'name': 'Dr. Rajnish Bariyar'
      },
      'serviceId': {
        'title': 'Stroke / Paralysis'
      }
    }
  ];

  static final List<Map<String, dynamic>> _mockServices = [
    {
      '_id': '1',
      'title': 'Stroke / Paralysis',
      'category': 'Neurological Rehabilitation',
      'description': 'Comprehensive neuro-rehabilitation to restore motor function, rebuild muscle strength, gait re-training, and stroke recovery.'
    },
    {
      '_id': '2',
      'title': "Parkinson's / Alzheimer's",
      'category': 'Neurological Rehabilitation',
      'description': 'Specialized neuro-physiotherapy focusing on posture, balance restoration, tremor management, and functional mobility.'
    },
    {
      '_id': '3',
      'title': "Facial / Bell's Palsy",
      'category': 'Neuro-Muscular Therapy',
      'description': 'Targeted neuromuscular facial stimulation, myofascial release, and facial symmetry exercises.'
    },
    {
      '_id': '4',
      'title': 'Vestibular Dysfunction',
      'category': 'Balance & Vestibular Care',
      'description': 'Vestibular rehabilitation therapy (VRT), vertigo management, and gaze stabilization exercises.'
    },
    {
      '_id': '5',
      'title': 'Cervical Spondylosis',
      'category': 'Spine & Orthopedic Care',
      'description': 'Advanced neck pain management, cervical decompression, manual traction, and posture correction.'
    },
    {
      '_id': '6',
      'title': 'Lumbar Spondylosis',
      'category': 'Spine & Orthopedic Care',
      'description': 'Lumbar spine decompression, core stabilization, sciatica relief, and disk rehabilitation.'
    },
    {
      '_id': '7',
      'title': 'OA (Knee Pain)',
      'category': 'Joint & Arthritis Care',
      'description': 'Osteoarthritis knee pain protocol with joint mobilization, quadriceps strengthening, and alignment therapy.'
    },
    {
      '_id': '8',
      'title': "Tennis / Golfer's Elbow",
      'category': 'Sports & Musculoskeletal',
      'description': 'Epicondylitis treatment with deep friction massage, ultrasound therapy, and eccentric tendon loading.'
    },
    {
      '_id': '9',
      'title': 'Frozen Shoulder',
      'category': 'Joint & Mobility Care',
      'description': 'Adhesive capsulitis multi-stage therapy including joint mobilization, capsular stretch, and ROM recovery.'
    },
    {
      '_id': '10',
      'title': 'CP Child',
      'category': 'Pediatric Rehabilitation',
      'description': 'Pediatric cerebral palsy physiotherapy using NDT, muscle tone regulation, and postural milestone stimulation.'
    },
    {
      '_id': '11',
      'title': 'Developmental Delay',
      'category': 'Pediatric Rehabilitation',
      'description': 'Early intervention pediatric physiotherapy to assist infants and children in achieving milestones.'
    },
    {
      '_id': '12',
      'title': 'Autism',
      'category': 'Pediatric Rehabilitation',
      'description': 'Sensory integration therapy, motor planning exercises, and neuromuscular regulation for ASD.'
    },
    {
      '_id': '13',
      'title': 'Prenatal & Postnatal Physiotherapy',
      'category': "Women's Health",
      'description': 'Pelvic floor strengthening, prenatal spine & girdle pain relief, and postnatal core recovery.'
    },
    {
      '_id': '14',
      'title': 'Knee / Hip Replacement Rehab',
      'category': 'Post-Surgical Rehabilitation',
      'description': 'Structured post-arthroplasty rehabilitation protocol: joint mobility, quad activation, and gait correction.'
    },
    {
      '_id': '15',
      'title': 'Sports Injury Management',
      'category': 'Sports Physiotherapy',
      'description': 'Advanced rehabilitation of ligament sprains, muscle strains, ACL/meniscus tears, and athletic conditioning.'
    }
  ];

  static final List<Map<String, dynamic>> _mockTherapists = [
    {
      '_id': 'dr_rajnish',
      'name': 'Dr. Rajnish Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'designation': "Founder & Chief Physiotherapist of Dr. Bariyar's Physiotherapy & Rehabilitation\nJoint Secretary, IAP (Jharkhand Branch)",
      'specialization': ['Stroke / Paralysis', "Parkinson's / Alzheimer's", 'Cervical & Lumbar Spondylosis', 'OA (Knee Pain)', 'Sports Injury'],
      'experience': 16,
      'rating': 5.0,
      'image': 'assets/images/dr_rajnish_head.png',
      'workingHours': '9:00 AM – 7:00 PM'
    },
    {
      '_id': 'dr_priyanka',
      'name': 'Dr. Priyanka Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'designation': "Co- Founder & Director of Dr. Bariyar's Physiotherapy & Neuro Rehabilitation",
      'specialization': ['CP Child', 'Developmental Delay', 'Autism', "Facial / Bell's Palsy", 'Prenatal & Postnatal Physiotherapy'],
      'experience': 14,
      'rating': 4.9,
      'image': 'assets/images/dr_priyanka_head.png',
      'workingHours': '9:00 AM – 7:00 PM'
    }
  ];

  ApiService() {
    _dio.options.baseUrl = _baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 10);
    _dio.options.receiveTimeout = const Duration(seconds: 10);

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'accessToken');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          print('[API ERROR] ${e.response?.statusCode} - ${e.response?.data}');
          return handler.next(e);
        },
      ),
    );
  }

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    if (_useMockMode) {
      await Future.delayed(const Duration(milliseconds: 400)); // Simulate network latency
      
      if (path.contains('/appointments/slots')) {
        return Response(
          requestOptions: RequestOptions(path: path),
          statusCode: 200,
          data: {
            'slots': [
              '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
              '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
              '05:00 PM', '06:00 PM'
            ]
          },
        );
      } else if (path.startsWith('/appointments')) {
        return Response(
          requestOptions: RequestOptions(path: path),
          statusCode: 200,
          data: {'appointments': _mockAppointments},
        );
      } else if (path.startsWith('/services')) {
        return Response(
          requestOptions: RequestOptions(path: path),
          statusCode: 200,
          data: {'services': _mockServices},
        );
      } else if (path.startsWith('/therapists')) {
        return Response(
          requestOptions: RequestOptions(path: path),
          statusCode: 200,
          data: {'therapists': _mockTherapists},
        );
      } else if (path.startsWith('/cms')) {
        return Response(
          requestOptions: RequestOptions(path: path),
          statusCode: 200,
          data: {
            'contact': {
              'phone': '+91 91109 12544',
              'secondaryPhone': '+91 96932 33447',
              'whatsapp': '+91 96932 33447',
              'drRajnishPhone': '+91 91109 12544',
              'drPriyankaPhone': '+91 96932 33447',
              'email': 'contact@quickphysio24.com',
              'address': 'Near, Ashok Nagar Rd No 1, opposite Overhead Water Tank, Ashok Nagar, Ranchi, Jharkhand 834002',
              'workingHours': '9:00 AM – 7:00 PM (Monday – Sunday)',
            }
          },
        );
      } else if (path.startsWith('/patients')) {
        final cachedName = await _storage.read(key: 'patientName') ?? 'Amarjeet Pandey';
        final cachedMobile = await _storage.read(key: 'userMobile') ?? '9334306358';
        final cachedEmail = await _storage.read(key: 'patientEmail') ?? 'amarjeet@globalwebify.com';
        final cachedAddress = await _storage.read(key: 'patientAddress') ?? 'Ashok Nagar, Ranchi, Jharkhand';
        final cachedPhoto = await _storage.read(key: 'patientPhoto') ?? '';
        final cachedGender = await _storage.read(key: 'patientGender') ?? 'male';
        final cachedDob = await _storage.read(key: 'patientDob') ?? '1995-06-15T00:00:00.000Z';
        final cachedEmergName = await _storage.read(key: 'emergName') ?? 'Pooja Pandey';
        final cachedEmergPhone = await _storage.read(key: 'emergPhone') ?? '9110912544';
        final cachedEmergRel = await _storage.read(key: 'emergRel') ?? 'Family Member';
        final historyRaw = await _storage.read(key: 'patientMedicalHistory');
        
        List<String> medicalHistory = [];
        if (historyRaw != null && historyRaw.isNotEmpty) {
          medicalHistory = historyRaw.split('|||').where((e) => e.isNotEmpty).toList();
        } else {
          medicalHistory = ['Post-Surgery Rehab', 'Routine Physiotherapy Checkup'];
        }

        return Response(
          requestOptions: RequestOptions(path: path),
          statusCode: 200,
          data: {
            'patient': {
              '_id': 'mock_patient_123',
              'name': cachedName,
              'dob': cachedDob,
              'gender': cachedGender,
              'address': cachedAddress,
              'profilePhoto': cachedPhoto,
              'userId': {
                'mobile': cachedMobile,
                'email': cachedEmail,
              },
              'medicalHistory': medicalHistory,
              'emergencyContact': {
                'name': cachedEmergName,
                'phone': cachedEmergPhone,
                'relation': cachedEmergRel,
              },
              'savedAddresses': [cachedAddress],
            }
          },
        );
      }
    }
    return await _dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data}) async {
    if (_useMockMode) {
      await Future.delayed(const Duration(milliseconds: 500)); // Simulate network latency

      if (path.startsWith('/auth/otp/send')) {
        return Response(
          requestOptions: RequestOptions(path: path),
          statusCode: 200,
          data: {'success': true, 'message': 'OTP Sent (Mock)'},
        );
      } else if (path.startsWith('/auth/otp/verify')) {
        final userMobile = data != null ? data['mobile'] ?? '9334306358' : '9334306358';
        final savedName = await _storage.read(key: 'patientName') ?? 'Amarjeet Pandey';
        await _storage.write(key: 'patientName', value: savedName);
        await _storage.write(key: 'userMobile', value: userMobile);

        return Response(
          requestOptions: RequestOptions(path: path),
          statusCode: 200,
          data: {
            'accessToken': 'mock_access_token_jwt',
            'refreshToken': 'mock_refresh_token_jwt',
            'patient': {
              'id': 'mock_patient_123',
              'name': savedName,
              'mobile': userMobile
            }
          },
        );
      } else if (path.startsWith('/patients')) {
        if (data != null) {
          if (data['name'] != null && data['name'].toString().isNotEmpty) {
            await _storage.write(key: 'patientName', value: data['name'].toString());
          }
          if (data['savedAddresses'] != null && (data['savedAddresses'] as List).isNotEmpty) {
            await _storage.write(key: 'patientAddress', value: data['savedAddresses'][0].toString());
          }
          if (data['profilePhoto'] != null) {
            await _storage.write(key: 'patientPhoto', value: data['profilePhoto'].toString());
          }
          if (data['gender'] != null) {
            await _storage.write(key: 'patientGender', value: data['gender'].toString());
          }
          if (data['dob'] != null) {
            await _storage.write(key: 'patientDob', value: data['dob'].toString());
          }
          if (data['email'] != null) {
            await _storage.write(key: 'patientEmail', value: data['email'].toString());
          }
          if (data['medicalHistory'] != null && data['medicalHistory'] is List) {
            final list = (data['medicalHistory'] as List).map((e) => e.toString()).toList();
            await _storage.write(key: 'patientMedicalHistory', value: list.join('|||'));
          }
          if (data['emergencyContact'] != null && data['emergencyContact'] is Map) {
            final ec = data['emergencyContact'] as Map;
            if (ec['name'] != null) await _storage.write(key: 'emergName', value: ec['name'].toString());
            if (ec['phone'] != null) await _storage.write(key: 'emergPhone', value: ec['phone'].toString());
            if (ec['relation'] != null) await _storage.write(key: 'emergRel', value: ec['relation'].toString());
          }
        }
        return Response(
          requestOptions: RequestOptions(path: path),
          statusCode: 200,
          data: {'success': true, 'message': 'Profile updated successfully'},
        );
      } else if (path.startsWith('/appointments')) {
        final newApptId = 'app_${DateTime.now().millisecondsSinceEpoch}';
        final serviceId = data['serviceId'];
        final therapistId = data['therapistId'];
        
        final selectedService = _mockServices.firstWhere((s) => s['_id'] == serviceId, orElse: () => _mockServices[0]);
        final selectedTherapist = _mockTherapists.firstWhere((t) => t['_id'] == therapistId, orElse: () => {
          'name': 'Auto Assigned Therapist'
        });

        final newAppt = {
          '_id': newApptId,
          'status': 'confirmed',
          'date': data['date'] ?? '2026-08-20',
          'timeSlot': data['timeSlot'] ?? '11:00 AM',
          'visitType': data['visitType'] ?? 'clinic',
          'therapistId': {
            'name': selectedTherapist['name']
          },
          'serviceId': {
            'title': selectedService['title']
          }
        };
        _mockAppointments.insert(0, newAppt); // Add to the top of list

        return Response(
          requestOptions: RequestOptions(path: path),
          statusCode: 201,
          data: {
            'appointment': {
              '_id': newApptId,
            }
          },
        );
      } else if (path.startsWith('/payments/verify')) {
        return Response(
          requestOptions: RequestOptions(path: path),
          statusCode: 200,
          data: {'success': true},
        );
      } else if (path.startsWith('/payments')) {
        return Response(
          requestOptions: RequestOptions(path: path),
          statusCode: 200,
          data: {
            'orderId': 'order_mock_${DateTime.now().millisecondsSinceEpoch}',
          },
        );
      }
    }
    return await _dio.post(path, data: data);
  }

  Future<Response> put(String path, {dynamic data}) async {
    if (_useMockMode) {
      await Future.delayed(const Duration(milliseconds: 400));
      if (path.startsWith('/appointments')) {
        final uriParts = path.split('/');
        final apptId = uriParts.length > 2 ? uriParts[2] : (data is Map ? (data['id'] ?? data['_id']) : null);
        if (apptId != null && data is Map) {
          final index = _mockAppointments.indexWhere((a) => a['_id'] == apptId);
          if (index != -1) {
            if (data['date'] != null) _mockAppointments[index]['date'] = data['date'];
            if (data['timeSlot'] != null) _mockAppointments[index]['timeSlot'] = data['timeSlot'];
            if (data['status'] != null) _mockAppointments[index]['status'] = data['status'];
          }
        }
      }
      return Response(requestOptions: RequestOptions(path: path), statusCode: 200, data: {'success': true});
    }
    return await _dio.put(path, data: data);
  }

  Future<Response> delete(String path) async {
    if (_useMockMode) {
      await Future.delayed(const Duration(milliseconds: 400));
      return Response(requestOptions: RequestOptions(path: path), statusCode: 200, data: {'success': true});
    }
    return await _dio.delete(path);
  }
}

import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  final Dio _dio = Dio();
  final _storage = const FlutterSecureStorage();

  // Toggle Mock Mode for offline testing/demo
  static const bool _useMockMode = false;
  static const String _baseUrl = 'https://physiotherapy-backend-nextjs.vercel.app/api';

  // In-memory mock databases for session persistence
  static final List<Map<String, dynamic>> _mockAppointments = [
    {
      '_id': 'app_1',
      'status': 'confirmed',
      'date': '2026-08-20',
      'timeSlot': '11:00 AM',
      'visitType': 'clinic',
      'therapistId': {
        'name': 'Dr. Anjali Verma'
      },
      'serviceId': {
        'title': 'Sports Injury Rehabilitation'
      }
    }
  ];

  static final List<Map<String, dynamic>> _mockServices = [
    {
      '_id': '1',
      'title': 'Sports Injury Rehabilitation',
      'description': 'Specialized therapy to recover from sports injuries and prevent re-injury.'
    },
    {
      '_id': '2',
      'title': 'Post-Operative Recovery',
      'description': 'Physical therapy designed to restore function and strength after surgical procedures.'
    },
    {
      '_id': '3',
      'title': 'Neurological Physiotherapy',
      'description': 'Therapy for neurological recovery.'
    }
  ];

  static final List<Map<String, dynamic>> _mockTherapists = [
    {
      '_id': 'ther_1',
      'name': 'Dr. Anjali Verma',
      'specialization': ['Sports Rehabilitation', 'Orthopedics'],
      'experience': 5
    },
    {
      '_id': 'ther_2',
      'name': 'Dr. Rohit Sharma',
      'specialization': ['Neuromuscular Therapy'],
      'experience': 4
    },
    {
      '_id': 'ther_3',
      'name': 'Dr. Neha Patel',
      'specialization': ['Cardiopulmonary', 'Pediatrics'],
      'experience': 3
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
              '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
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
        return Response(
          requestOptions: RequestOptions(path: path),
          statusCode: 200,
          data: {
            'accessToken': 'mock_access_token_jwt',
            'refreshToken': 'mock_refresh_token_jwt',
            'patient': {
              'id': 'mock_patient_123',
              'name': 'Rahul Kumar',
              'mobile': data != null ? data['mobile'] : '9334306358'
            }
          },
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
